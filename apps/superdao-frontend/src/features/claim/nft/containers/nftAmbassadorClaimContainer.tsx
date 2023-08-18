/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FC, useEffect, useRef, useState } from 'react';

import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';

// components
import { PageContent, PageLoader } from 'src/components';
import { isString, MessageName } from '@sd/superdao-shared';
import { HasNftModal } from 'src/features/claim/nft/components/hasNftModal';
import { UnknownErrorModal } from 'src/features/claim/nft/components/unknownErrorModal';
import { CustomHead } from 'src/components/head';

// socket.io
import { socketConnection } from 'src/components/socketProvider';
import { NftClaimLayout } from 'src/features/claim/nft/containers/nftClaimLayout';
import { claimProcessImage, EmailClaimInfoLayout, mascotSweatingImage } from '../components/emailClaimInfoLayout';
import { useClaimAmbassadorNftMutation } from 'src/gql/referral.generated';
import { ReferralMessage } from 'src/types/types.generated';

export type NftReferralClaimProps = {
	referralCampaignId: string;
	tier: string;
	slug: string;
	linkLimitExceeded: boolean;
	onSuccessClaim: () => void;
};

export const NftAmbassadorClaimContainer: FC<NftReferralClaimProps> = (props) => {
	const { referralCampaignId, tier, slug, linkLimitExceeded, onSuccessClaim } = props;
	const { t } = useTranslation();
	const [isClaiming, setIsClaiming] = useState(false);
	const [showHasNftModal, setShowHasNftModal] = useState(false);
	const [showUnknownErrorModal, setShowUnknownErrorModal] = useState(false);
	const [showLoadingState, setShowLoadingState] = useState(false);
	const [limitExceededError, setLimitExceededError] = useState(linkLimitExceeded);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { query, push } = useRouter();
	const claimSecret = isString(query.s) ? query.s : null;

	const onError = (showModal: (value: boolean) => void) => {
		setIsClaiming(false);
		setShowLoadingState(false);
		setShowUnknownErrorModal(true);
		showModal(true);
		if (timer?.current) {
			clearTimeout(timer.current);
		}
	};

	const claim = useClaimAmbassadorNftMutation();
	const redirectToDao = () => push(`/${slug}`);

	const onClaim = () => {
		timer.current = setTimeout(() => setShowLoadingState(true), 250);
		setIsClaiming(true);
		claim.mutate(
			{ referralCampaignId, claimSecret },
			{
				onSuccess: ({ claimAmbassadorNft: res }) => {
					if (res.transactionInitiated) return;

					switch (res.message) {
						case ReferralMessage.ClaimNftFailHasNft:
							onError(setShowHasNftModal);
							break;
						case ReferralMessage.ReferralFailLimit:
							onError(setLimitExceededError);
							break;
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
		socketConnection?.on(MessageName.CLAIM_NFT_SUCCESS, () => {
			onSuccessClaim();
		});

		return () => {
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL);
			socketConnection?.off(MessageName.CLAIM_NFT_SUCCESS);
		};
	}, []);

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery({ slug });
	const { contractAddress, name, description, avatar } = daoData?.daoBySlug || {};

	const { data: collectionData, isLoading } = useNftCollectionQuery(
		{ daoAddress: contractAddress! },
		{ enabled: !!contractAddress }
	);

	const { collection } = collectionData || {};

	if (isLoading || isDaoLoading) {
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

	if (!collection || !daoData?.daoBySlug) return null;

	const currentTier = collection.tiers.find(({ id }) => id.toLowerCase() === tier?.toLowerCase());
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
