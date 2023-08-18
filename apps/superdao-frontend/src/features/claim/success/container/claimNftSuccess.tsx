import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import isNil from 'lodash/isNil';

import { useNftCollectionQuery, useVerifyWhitelistClaimQuery } from 'src/gql/nft.generated';
import { ArtworkView, Avatar, Body, Button, ConfettiCanvas, Label1, PageLoader, Title1, Title2 } from 'src/components';
import { NftTierAndAmount } from 'src/features/checkout/internal/components';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';
import { NotInWhitelistModal } from 'src/features/claim/nft/components/notInWhitelistModal';
import { HowToNftButton } from 'src/components/howToNftButton';

import { ShareClaimSuccessDropdown } from '../components/shareClaimSuccessDropdown';
import { CustomClaimLayout } from '../components/customClaimLayout';
import { NftClaimHeader } from '../../nft/components/nftClaimHeader';
import { NftMetadata } from 'src/types/types.generated';
import { AuthUI } from 'src/features/auth';

type Props = {
	isSharingEnabled: boolean;
	hostname: string;
	protocol: string;
	daoName: string;
	daoAddress: string;
	userId?: string;
	tokenId?: number;
	artwork?: NftMetadata;
};

/**
 * Показ success экрана после клейма конкретного Tier.
 * В случае, если удается получить данные mintedNftMeta, показываем доп инфу и меняем sharing link
 */
export const ClaimNftSuccessContainer = ({
	hostname,
	protocol,
	daoName,
	isSharingEnabled,
	tokenId,
	userId,
	daoAddress,
	artwork
}: Props) => {
	const { t } = useTranslation();
	const { query, push, asPath } = useRouter();
	const slug = typeof query.slug === 'string' ? query.slug : '';
	const tier = typeof query.tier === 'string' ? query.tier : '';
	const daoSlug = typeof query.daoSlug === 'string' ? query.daoSlug : '';
	const isClaimByEmail = query.byEmail === '1';
	const isClaimByReferralLink = query.byReferral === '1';

	const { authModalIsShown, openAuthModal } = AuthUI.useAuthModal();
	const [isSocialShareDropdownOpen, setIsSocialShareDropdownOpen] = useState(false);

	/**
	 * Чтобы не зависеть от проблем по вытаскиванию mintedNftMeta остается fallback на показ success без данных о сминченной nft
	 */
	const linkTail = isNil(tokenId) ? asPath : `/users/${userId}/${daoAddress}/${tokenId}`;
	const fullUrl = protocol + hostname + linkTail;

	const redirectToDao = () => push(`/${slug}`);

	const handleSwitchSocialShareDropdownMode = () => {
		setIsSocialShareDropdownOpen(!isSocialShareDropdownOpen);
	};

	const handleOffSocialShareDropdownMode = () => {
		setIsSocialShareDropdownOpen(false);
	};

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery({ slug });
	const {
		contractAddress,
		name,
		description,
		id,
		avatar,
		claimDeployDao: isClaimWithDeployDao
	} = daoData?.daoBySlug || {};

	const { data, isLoading } = useNftCollectionQuery({ daoAddress: contractAddress! }, { enabled: !!contractAddress });
	const { collection } = data || {};

	const { data: whitelistVerification, isLoading: isWhitelistVerificationLoading } = useVerifyWhitelistClaimQuery(
		{ daoAddress: contractAddress!, tier },
		{ enabled: !!contractAddress && !!isClaimByEmail && !isClaimByReferralLink }
	);
	const { getVerifyWhitelistClaim: isInWhitelist } = whitelistVerification || {};

	if (isLoading || isDaoLoading || isWhitelistVerificationLoading) {
		return (
			<CustomClaimLayout name={name} description={description}>
				<PageLoader />
			</CustomClaimLayout>
		);
	}

	if (authModalIsShown) return null;

	if (!!isClaimByEmail && !isClaimByReferralLink) redirectToDao();

	if (!collection) return null;
	const { name: collectionName, tiers } = collection;

	const currentTier = tiers.find(({ id }) => id.toLowerCase() === tier.toLowerCase());
	if (!currentTier) return null;

	if (!isInWhitelist && !!isClaimByEmail && !isClaimByReferralLink)
		return (
			<CustomClaimLayout name={name} description={description}>
				<NotInWhitelistModal onBack={redirectToDao} onAction={openAuthModal} />
			</CustomClaimLayout>
		);

	const { totalAmount, maxAmount, artworks, tierName } = currentTier;
	const finalArtworks = artwork ? [artwork] : artworks;

	let continueUrl = `/${daoSlug}`;

	if (isClaimByReferralLink) continueUrl = `${continueUrl}?byReferral=1`;
	else if (isClaimWithDeployDao) continueUrl = `${continueUrl}?isNew=1&isClaim=1`;

	const buttonText = isClaimWithDeployDao ? t('actions.labels.continue') : `${t('actions.labels.goto')} ${daoName}`;

	return (
		<CustomClaimLayout onBack={redirectToDao} name={name} description={description}>
			<ConfettiCanvas />
			<div className="flex h-full flex-col items-center">
				<NftClaimHeader className="w-full pt-2 pb-1 sm:px-3 lg:hidden" onClose={redirectToDao} isLogoOnly />

				<div className="flex h-full flex-col items-center justify-center gap-7 py-2 sm:flex-row sm:gap-10 sm:py-5 sm:px-16">
					<div className="bg-backgroundSecondary w-[240px] min-w-[240px] rounded-xl p-4 shadow-xl sm:w-auto">
						<div className="mb-3 overflow-hidden rounded-lg">
							<ArtworkView
								artworks={finalArtworks}
								className="bg-backgroundTertiary m-auto max-h-[208px] max-w-[208px]"
								artworksTotalLength={finalArtworks.length}
							/>
						</div>

						<NftTierAndAmount
							className="max-w-[208px]"
							name={collectionName}
							totalAmount={totalAmount}
							maxAmount={maxAmount}
						/>

						<Title2 className="mt-1">{tierName}</Title2>

						<div className="mt-2 flex gap-2">
							<Avatar size="xs" seed={id} fileId={avatar} />
							<Body className="truncate">{name}</Body>
						</div>
					</div>

					<div className="flex flex-col items-center text-center sm:items-start sm:text-left">
						<Title1 className="mb-2">{t('pages.claim.success.heading')}</Title1>

						<Label1 className="text-foregroundSecondary mb-2 font-normal">
							{t('pages.claim.success.description')}
							<br />
							{t('pages.claim.success.subDescription')}
						</Label1>

						<HowToNftButton className="mt-3" />

						<div className="mt-6 flex gap-3">
							<Button
								onClick={() => push(continueUrl)}
								className="w-fit"
								color="accentPrimary"
								size="lg"
								label={buttonText}
							/>
							{isSharingEnabled && (
								<ShareClaimSuccessDropdown
									isSocialShareDropdownOpen={isSocialShareDropdownOpen}
									fullUrl={fullUrl}
									targetNftUrl={protocol + hostname + `/${slug}/${tier}`}
									daoName={daoName}
									handleSwitchSocialShareDropdownMode={handleSwitchSocialShareDropdownMode}
									onClickOutside={handleOffSocialShareDropdownMode}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</CustomClaimLayout>
	);
};
