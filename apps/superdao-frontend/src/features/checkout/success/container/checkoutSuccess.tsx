import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import isNil from 'lodash/isNil';
import {
	Article1,
	ArtworkView,
	Avatar,
	Body,
	Button,
	ConfettiCanvas,
	Label1,
	PageLoader,
	Title2
} from 'src/components';
import { NftTierAndAmount } from 'src/features/checkout/internal/components';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';
import { HowToNftButton } from 'src/components/howToNftButton';
import { useSwitch } from 'src/hooks';

import { useCheckoutDataContext } from '../../internal/context/checkoutDataContext';
import { ShareClaimSuccessDropdown } from 'src/features/claim/success/components/shareClaimSuccessDropdown';
import { CustomSuccessLayout } from '../components/customSuccessLayout';

import { useCheckoutNavigationContext } from '../../internal/context/checkoutNavigationContext';
import { NftMetadata } from 'src/types/types.generated';

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
 * Показ success экрана после покупки конкретного Tier.
 * В случае, если удается получить данные mintedNftMeta, показываем доп инфу и меняем sharing link
 */
export const CheckoutSuccessContainer = (props: Props) => {
	const { hostname, protocol, daoName, userId, isSharingEnabled, artwork, daoAddress, tokenId } = props;

	const { slug, tierInfo } = useCheckoutDataContext();
	const { navigation } = useCheckoutNavigationContext();
	const { asPath } = useRouter();

	const { t } = useTranslation();

	/**
	 * Чтобы не зависеть от проблем по вытаскиванию mintedNftMeta остается fallback на показ success без данных о сминченной nft
	 */
	const linkTail = isNil(tokenId) ? asPath : `/users/${userId}/${daoAddress}/${tokenId}`;
	const fullUrl = protocol + hostname + linkTail;

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery(
		{ slug },
		{
			onError: (error) => {}
		}
	);
	const { id, name, description, avatar } = daoData?.daoBySlug || {};

	const [
		isSocialShareDropdownOpen,
		{ off: handleOffSocialShareDropdownMode, toggle: handleSwitchSocialShareDropdownMode }
	] = useSwitch(false);

	if (isDaoLoading) {
		return (
			<CustomSuccessLayout name={name} description={description}>
				<PageLoader />
			</CustomSuccessLayout>
		);
	}

	const { collectionName, totalAmount, maxAmount, artworks, tierName, id: tierId } = tierInfo;
	const finalArtworks = artwork ? [artwork] : artworks;

	return (
		<CustomSuccessLayout name={name} description={description}>
			<ConfettiCanvas />
			<div className="flex h-full flex-col items-center gap-7 py-2 sm:flex-row sm:gap-10 sm:py-5 sm:px-12">
				<img className="-mb-4 sm:hidden" src="/logo-full.svg" height={56} alt="" />

				<div className="bg-backgroundSecondary w-[240px] min-w-[240px] rounded-xl p-4 shadow-xl sm:w-auto">
					<div className="overflow-hidden rounded-lg">
						<ArtworkView
							artworks={finalArtworks}
							className="bg-backgroundTertiary m-auto max-h-[208px] max-w-[208px]"
							artworksTotalLength={finalArtworks.length}
							sliderProps={{ isSlider: true, className: 'max-w-[240px] mb-3 rounded-lg overflow-hidden' }}
						/>
					</div>

					<NftTierAndAmount
						className="mt-3 max-w-[208px]"
						name={collectionName}
						totalAmount={totalAmount}
						maxAmount={maxAmount}
					/>

					<Title2 className="mt-1 max-w-[208px] truncate">{tierName || tierId}</Title2>

					<div className="mt-2 flex gap-2">
						<Avatar size="xs" seed={id} fileId={avatar} />
						<Body className="truncate">{name}</Body>
					</div>
				</div>

				<div className="flex flex-col items-center text-center sm:items-start sm:text-left">
					<Article1 className="mb-2">{t('pages.checkout.success.heading')}</Article1>

					<Label1 className="text-foregroundSecondary mb-2 font-normal">
						{t('pages.checkout.success.description')}
					</Label1>

					<HowToNftButton className="mt-3" />

					<div className="mt-6 flex gap-3">
						<Button
							onClick={() => navigation.toDaoProfile()}
							className="w-fit"
							color="accentPrimary"
							size="lg"
							label={t('actions.labels.continue')}
						/>
						{isSharingEnabled && (
							<ShareClaimSuccessDropdown
								isSocialShareDropdownOpen={isSocialShareDropdownOpen}
								fullUrl={fullUrl}
								targetNftUrl={protocol + hostname + navigation.paths.nftDetails}
								daoName={daoName}
								handleSwitchSocialShareDropdownMode={handleSwitchSocialShareDropdownMode}
								onClickOutside={handleOffSocialShareDropdownMode}
							/>
						)}
					</div>
				</div>
			</div>
		</CustomSuccessLayout>
	);
};
