/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import throttle from 'lodash/throttle';
import { FC, useEffect, useRef, useState } from 'react';

import { useClaimNftByEmailMutation, useNftCollectionQuery } from 'src/gql/nft.generated';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';

// components
import { PageContent, PageLoader } from 'src/components';
import { ClaimEndedModal } from 'src/features/claim/nft/components/claimEndedModal';
import { HasNftModal } from 'src/features/claim/nft/components/hasNftModal';
import { UnknownErrorModal } from 'src/features/claim/nft/components/unknownErrorModal';
import { CustomHead } from 'src/components/head';

// socket.io
import { socketConnection } from 'src/components/socketProvider';
import { NftClaimLayout } from 'src/features/claim/nft/containers/nftClaimLayout';
import { openExternal } from 'src/utils/urls';
import { WhitelistStatusEnum } from 'src/types/types.generated';
import { useGetWhitelistRecordQuery } from 'src/gql/whitelist.generated';
import {
	alreadyUsedImage,
	claimProcessImage,
	EmailClaimInfoLayout,
	mascotSadImage
} from '../components/emailClaimInfoLayout';
import { ClaimNftSuccessMessageBody, MessageName } from '@sd/superdao-shared';
import { AuthUI } from 'src/features/auth';

type NftEmailClaimProps = {
	isNotAuthorized?: boolean;
};

//will remove after test (maybe i need use something from this)
export const NftEmailClaimContainer: FC<NftEmailClaimProps> = ({ isNotAuthorized }) => {
	const { t } = useTranslation();
	const [isClaiming, setIsClaiming] = useState(false);
	const [showHasNftModal, setShowHasNftModal] = useState(false);
	const [showUnknownErrorModal, setShowUnknownErrorModal] = useState(false);
	const [showLoadingState, setShowLoadingState] = useState(false);

	const { authModalIsShown, openAuthModal, closeAuthModal } = AuthUI.useAuthModal();

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { query, push, asPath } = useRouter();
	const slug = typeof query.slug === 'string' ? query.slug : '';
	const uid = typeof query.uid === 'string' ? query.uid : '';
	const autoClaim = typeof query.autoClaim === 'string' ? query.autoClaim : '';

	const onResponseError = (error: string | unknown) => {
		const message = typeof error === 'string' ? JSON.parse(error)?.[0]?.message : undefined;

		setShowUnknownErrorModal(true);
		setIsClaiming(false);
		setShowLoadingState(false);
		onError(setShowUnknownErrorModal);
		throttledRedirectToDao();
	};

	const { data: whitelistRecord } = useGetWhitelistRecordQuery(
		{ id: uid },
		{
			onError: onResponseError
		}
	);

	const { status, tiers } = whitelistRecord?.getWhitelistRecord || {};

	const redirectToAutoClaim = () => {
		closeAuthModal();

		const search = window.location.search ? `${window.location.search}&autoClaim=1` : '?autoClaim=1';
		const path = `${asPath}${search}`;

		push(path);
	};
	const redirectToDao = () => push(`/${slug}`);
	const throttledRedirectToDao = throttle(redirectToDao, 500);
	const onError = (showModal: (value: boolean) => void) => {
		setIsClaiming(false);
		setShowLoadingState(false);
		setShowUnknownErrorModal(true);
		showModal(true);
		if (timer?.current) {
			clearTimeout(timer.current);
		}
	};

	const { mutate: claimNftByEmail } = useClaimNftByEmailMutation();

	const onClaim = () => {
		if (isNotAuthorized && slug && uid) {
			return openAuthModal({ onSuccess: redirectToAutoClaim });
		}

		timer.current = setTimeout(() => setShowLoadingState(true), 250);
		setIsClaiming(true);

		claimNftByEmail(
			{ uid },
			{
				onError: onResponseError
			}
		);
	};

	useEffect(() => {
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL, () => onError(setShowUnknownErrorModal));
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL_HAS_NFT, () => onError(setShowHasNftModal));
		socketConnection?.on(MessageName.CLAIM_NFT_SUCCESS, (data: ClaimNftSuccessMessageBody) => {
			push(`/${slug}/claim/success?tier=${data.tier}&daoSlug=${data.daoSlug}&byEmail=${uid}`);
		});

		return () => {
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL);
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL_HAS_NFT);
			socketConnection?.off(MessageName.CLAIM_NFT_SUCCESS);
		};
	}, []);

	useEffect(() => {
		if (autoClaim === '1') {
			onClaim?.();
		}
	}, [autoClaim]);

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery({ slug });
	const { contractAddress, name, description, avatar } = daoData?.daoBySlug || {};

	const { data: collectionData, isLoading } = useNftCollectionQuery(
		{ daoAddress: contractAddress! },
		{ enabled: !!contractAddress }
	);

	const { collection } = collectionData || {};

	if (status === WhitelistStatusEnum.Used) {
		return (
			<EmailClaimInfoLayout
				image={alreadyUsedImage}
				title={t('pages.claim.emailNftClaiming.alreadyTitle')}
				description={
					<>
						{t('pages.claim.emailNftClaiming.alreadyDescription')} <br />
						{t('pages.claim.emailNftClaiming.alreadySupport')}
					</>
				}
				btn={[t('pages.claim.emailNftClaiming.alreadyBtn'), () => openExternal(`https://t.me/superdao_team`)]}
			/>
		);
	}

	if (status === WhitelistStatusEnum.Disabled || status === WhitelistStatusEnum.Archived) {
		return (
			<EmailClaimInfoLayout
				image={mascotSadImage}
				title={t('pages.claim.emailNftClaiming.deactivatedTitle')}
				description={t('pages.claim.emailNftClaiming.deactivatedDescription')}
			/>
		);
	}

	if (isLoading || isDaoLoading) {
		return (
			<PageContent className="h-[calc(100vh-20px)]">
				<CustomHead
					main={name ? name : 'Claim'}
					additional={name ? 'Claim' : 'Superdao'}
					description={description ?? ''}
					avatar={avatar ?? null}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	if (authModalIsShown) return null;

	if (!collection || !daoData?.daoBySlug) return null;

	const currentTier = collection.tiers.find(({ id }) => id.toLowerCase() === tiers?.[0].toLowerCase());

	if (!currentTier || currentTier.totalAmount === currentTier.maxAmount)
		return <ClaimEndedModal onRedirect={redirectToDao} />;
	if (showHasNftModal) return <HasNftModal onRedirect={redirectToDao} />;
	if (showUnknownErrorModal) return <UnknownErrorModal onClose={() => setShowUnknownErrorModal(false)} />;
	if (isClaiming) {
		return (
			<EmailClaimInfoLayout
				image={claimProcessImage}
				title={t('pages.claim.emailNftClaiming.processTitle')}
				isLoading
				description={t('pages.claim.emailNftClaiming.processDescription')}
			/>
		);
	}

	const tierData = { ...collection, ...currentTier };

	return (
		<NftClaimLayout
			daoData={daoData.daoBySlug}
			tierData={tierData}
			isClaiming={isClaiming}
			onClaim={onClaim}
			showLoadingState={showLoadingState}
			isEmailClaim
			onClose={redirectToDao}
		/>
	);
};
