/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FC, useEffect, useRef, useState } from 'react';

import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';

// components
import { PageContent, PageLoader } from 'src/components';
import { HasNftModal } from 'src/features/claim/nft/components/hasNftModal';
import { UnknownErrorModal } from 'src/features/claim/nft/components/unknownErrorModal';
import { CustomHead } from 'src/components/head';

// socket.io
import { socketConnection } from 'src/components/socketProvider';
import { NftClaimLayout } from 'src/features/claim/nft/containers/nftClaimLayout';
import { useAmbassadorStatusQuery, useClaimReferralNftMutation } from 'src/gql/referral.generated';
import { AmbassadorStatus, ReferralMessage } from 'src/types/types.generated';
import { claimProcessImage, EmailClaimInfoLayout, mascotSweatingImage } from '../components/emailClaimInfoLayout';
import { MessageName, ReferralClaimNftSuccessMessageBody } from '@sd/superdao-shared';
import { AuthUI } from 'src/features/auth';

export type NftReferralClaimProps = {
	isAuthorized?: boolean;
	shortId: string;
	tierId: string;
	slug: string;
	linkLimitExceeded: boolean;
	referralCampaignShortId: string;
	isRecursiveCampaign: boolean;
};

export const NftReferralClaimContainer: FC<NftReferralClaimProps> = (props) => {
	const { isAuthorized, shortId, tierId, slug, linkLimitExceeded, referralCampaignShortId, isRecursiveCampaign } =
		props;
	const { t } = useTranslation();
	const { authModalIsShown, openAuthModal } = AuthUI.useAuthModal();

	const [isClaiming, setIsClaiming] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [showHasNftModal, setShowHasNftModal] = useState(false);
	const [showUnknownErrorModal, setShowUnknownErrorModal] = useState(false);
	const [showLoadingState, setShowLoadingState] = useState(false);
	const [limitExceededError, setLimitExceededError] = useState(linkLimitExceeded);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { query, push, asPath } = useRouter();

	const autoClaim = typeof query.autoClaim === 'string' ? query.autoClaim : '';

	const redirectToAutoClaim = () => {
		const search = window.location.search ? `${window.location.search}&autoClaim=1` : '?autoClaim=1';
		const path = `${asPath}${search}`;

		push(path);
	};
	const redirectToDao = () => push(`/${slug}`);
	const redirectToReferalCampaign = () => push(`/${slug}/referral/${referralCampaignShortId}`);

	const onError = (showModal: (value: boolean) => void) => {
		setIsClaiming(false);
		setShowLoadingState(false);
		setShowUnknownErrorModal(true);
		showModal(true);
		if (timer?.current) {
			clearTimeout(timer.current);
		}
	};

	const { isLoading: isAmbassadorStatusLoading } = useAmbassadorStatusQuery(
		{
			referralCampaignShortId,
			claimSecret: null
		},
		{
			enabled: isAuthorized,
			onSuccess: (data) => {
				if (data.ambassadorStatus.message === AmbassadorStatus.HasAmbassadorNft) {
					if (isRecursiveCampaign) {
						setIsRedirecting(true);
						redirectToReferalCampaign();
					} else {
						setShowHasNftModal(true);
					}
				}
			}
		}
	);

	const claim = useClaimReferralNftMutation();

	const onClaim = () => {
		if (!isAuthorized) {
			openAuthModal({ onClose: null, onSuccess: redirectToAutoClaim });
			return;
		}

		timer.current = setTimeout(() => setShowLoadingState(true), 250);
		setIsClaiming(true);
		claim.mutate(
			{ referralLinkShortId: shortId },
			{
				onSuccess: ({ claimReferralNft: res }) => {
					if (res.transactionInitiated) return;

					switch (res.message) {
						case ReferralMessage.ClaimNftFailHasNft:
							onError(setShowHasNftModal);
							break;
						case ReferralMessage.ClaimNftFailHasNft:
							onError(setLimitExceededError);
							break;
						default:
							onError(setShowUnknownErrorModal);
					}
				},
				onError: (error) => {
					setShowUnknownErrorModal(true);
					setIsClaiming(false);
					setShowLoadingState(false);
				}
			}
		);
	};

	useEffect(() => {
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL, () => onError(setShowUnknownErrorModal));
		socketConnection?.on(MessageName.CLAIM_NFT_SUCCESS, (data: ReferralClaimNftSuccessMessageBody) => {
			if (data.isAmbassadorNow) push(`/${slug}/referral/${referralCampaignShortId}?success=1`);
			else push(`/${slug}/claim/success?tier=${data.tier}&daoSlug=${data.daoSlug}&byReferral=1`);
		});

		return () => {
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL);
			socketConnection?.off(MessageName.CLAIM_NFT_SUCCESS);
		};
	}, []);

	useEffect(() => {
		if (autoClaim === '1') {
			onClaim();
		}
	}, [autoClaim]);

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery({ slug });
	const { contractAddress, name, description, avatar } = daoData?.daoBySlug || {};

	const { data: collectionData, isLoading } = useNftCollectionQuery(
		{ daoAddress: contractAddress! },
		{ enabled: !!contractAddress }
	);

	const { collection } = collectionData || {};

	if (isLoading || isDaoLoading || isAmbassadorStatusLoading || isRedirecting) {
		return (
			<PageContent>
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

	const currentTier = collection.tiers.find(({ id }) => id.toLowerCase() === tierId.toLowerCase());
	if (!currentTier) return null;

	const tierData = { ...collection, ...currentTier };

	const tierLimitExceeded = currentTier.totalAmount === currentTier.maxAmount;

	if (tierLimitExceeded || limitExceededError) {
		return (
			<EmailClaimInfoLayout
				image={mascotSweatingImage}
				title={t('No NFTs left')}
				description={t('All available NFTs were already claimed')}
				btn={[t('Go to DAO'), redirectToDao]}
			/>
		);
	}

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
