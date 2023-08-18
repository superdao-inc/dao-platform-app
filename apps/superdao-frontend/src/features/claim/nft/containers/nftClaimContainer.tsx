/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { useClaimNftMutation, useNftCollectionQuery, useVerifyWhitelistClaimQuery } from 'src/gql/nft.generated';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';

// components
import { PageContent, PageLoader } from 'src/components';
import { ClaimEndedModal } from 'src/features/claim/nft/components/claimEndedModal';
import { NotInWhitelistModal } from 'src/features/claim/nft/components/notInWhitelistModal';
import { ClaimNftSuccessMessageBody, MessageName } from '@sd/superdao-shared';
import { HasNftModal } from 'src/features/claim/nft/components/hasNftModal';
import { UnknownErrorModal } from 'src/features/claim/nft/components/unknownErrorModal';
import { CustomHead } from 'src/components/head';

// socket.io
import { socketConnection } from 'src/components/socketProvider';
import { AuthUI } from 'src/features/auth';
import { NftClaimLayout } from './nftClaimLayout';

export const NftClaimContainer = () => {
	const { authModalIsShown, openAuthModal } = AuthUI.useAuthModal();

	const [isClaiming, setIsClaiming] = useState(false);
	const [showHasNftModal, setShowHasNftModal] = useState(false);
	const [showUnknownErrorModal, setShowUnknownErrorModal] = useState(false);
	const [showLoadingState, setShowLoadingState] = useState(false);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { query, push } = useRouter();
	const slug = typeof query.slug === 'string' ? query.slug : '';
	const tier = typeof query.tier === 'string' ? query.tier : '';

	const redirectToDao = () => push(`/${slug}`);
	const onError = (showModal: (value: boolean) => void) => {
		setIsClaiming(false);
		setShowLoadingState(false);
		setShowUnknownErrorModal(true);
		showModal(true);
		if (timer?.current) {
			clearTimeout(timer.current);
		}
	};

	useEffect(() => {
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL, () => onError(setShowUnknownErrorModal));
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL_HAS_NFT, () => onError(setShowHasNftModal));
		socketConnection?.on(MessageName.CLAIM_NFT_SUCCESS, (data: ClaimNftSuccessMessageBody) => {
			push(`/${slug}/claim/success?tier=${data.tier}&daoSlug=${data.daoSlug}`);
		});

		return () => {
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL);
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL_HAS_NFT);
			socketConnection?.off(MessageName.CLAIM_NFT_SUCCESS);
		};
	}, []);

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery({ slug });
	const { contractAddress, isClaimEnabled, name, description, avatar } = daoData?.daoBySlug || {};

	const { data: collectionData, isLoading } = useNftCollectionQuery(
		{ daoAddress: contractAddress! },
		{ enabled: !!contractAddress }
	);
	const { collection } = collectionData || {};

	const { data: whitelistVerification, isLoading: isWhitelistVerificationLoading } = useVerifyWhitelistClaimQuery(
		{ daoAddress: contractAddress!, tier },
		{ enabled: !!contractAddress }
	);
	const { getVerifyWhitelistClaim: isInWhitelist } = whitelistVerification || {};

	const { mutate: claimNft } = useClaimNftMutation();

	if (isLoading || isDaoLoading || isWhitelistVerificationLoading) {
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
	if (!isClaimEnabled) redirectToDao();

	const currentTier = collection.tiers.find(({ id }) => id.toLowerCase() === tier.toLowerCase());
	if (!currentTier) return null;

	const tierData = { ...collection, ...currentTier };

	if (currentTier.totalAmount === currentTier.maxAmount) return <ClaimEndedModal onRedirect={redirectToDao} />;
	if (!isInWhitelist) return <NotInWhitelistModal onBack={redirectToDao} onAction={openAuthModal} />;
	if (showHasNftModal) return <HasNftModal onRedirect={redirectToDao} />;
	if (showUnknownErrorModal) return <UnknownErrorModal onClose={() => setShowUnknownErrorModal(false)} />;

	const onClaim = () => {
		timer.current = setTimeout(() => setShowLoadingState(true), 250);
		setIsClaiming(true);
		claimNft(
			{ tier, daoAddress: contractAddress! },
			{
				onError: () => {
					setShowUnknownErrorModal(true);
					setIsClaiming(false);
					setShowLoadingState(false);
				}
			}
		);
	};

	return (
		<NftClaimLayout
			daoData={daoData.daoBySlug}
			tierData={tierData}
			isClaiming={isClaiming}
			onClaim={onClaim}
			showLoadingState={showLoadingState}
		/>
	);
};
