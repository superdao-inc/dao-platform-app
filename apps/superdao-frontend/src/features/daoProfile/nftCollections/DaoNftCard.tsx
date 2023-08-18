import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { memo, useCallback, useMemo } from 'react';

import { formatEthersPriceWithSymbol, formatUsdValue } from 'src/utils/formattes';
import { NftCard } from 'src/components/nftCard';
import { CurrencySymbol, NftTier } from 'src/types/types.generated';
import { NftCardTierInfo } from 'src/components/nftCard/nftCardTierInfo';
import { NftCardTitle } from 'src/components/nftCard/nftCardTitle';
import { useExchangeQuery } from 'src/gql/exchange.generated';

import { FiatCoinMarketCapId, getTokenDecimalsBySymbol, getTokenIdBySymbol } from '@sd/superdao-shared';
import { useCheckChain } from 'src/hooks/useCheckChain';
import { useVerifyWhitelistSaleQuery } from 'src/gql/nft.generated';
import NftCardBottomDescription from 'src/components/nftCard/nftCardBottomDescription';
import { getSalePrice } from 'src/utils/getSalePrice';
import { NftCardAction } from 'src/components/nftCard/nftCardAction';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { useRedirectToCheckout } from 'src/features/checkout/internal/hooks/useRedirectToCheckout';
import { SkeletonLoader } from 'src/pagesComponents/dao/daoShowcaseCard';

type DaoNftCardProps = {
	tier: NftTier;
	slug: string;
	daoAddress: string;
	walletAddress: string | undefined;
	collectionName?: string;
	isOpenSaleActive: boolean;
	isWhitelistSaleActive: boolean;
	isSaleActive: boolean;
	isSaleLoading: boolean;
	isCollectionLoading: boolean;
};

const DaoNftCard = (props: DaoNftCardProps) => {
	const {
		tier,
		collectionName,
		slug,
		daoAddress,
		walletAddress,
		isOpenSaleActive,
		isWhitelistSaleActive,
		isSaleActive,
		isSaleLoading,
		isCollectionLoading
	} = props;

	const { t } = useTranslation();

	const { push } = useRouter();

	const { data: verify, isLoading } = useVerifyWhitelistSaleQuery(
		{
			daoAddress,
			tier: tier.id
		},
		{
			enabled: isWhitelistSaleActive && Boolean(walletAddress)
		}
	);

	const isWhitelistVerified = Boolean(verify?.getVerify);

	const isWhitelistSaleAvailable = isWhitelistSaleActive && isWhitelistVerified;

	const tokenSymbol = useMemo(() => {
		const tierCurrency = tier.currency ?? CurrencySymbol.Matic;

		if (isWhitelistVerified) {
			return isWhitelistSaleActive ? CurrencySymbol.Matic : tierCurrency;
		}

		if (isWhitelistSaleActive && isOpenSaleActive) {
			return tierCurrency;
		}

		return isWhitelistSaleActive && !isOpenSaleActive ? CurrencySymbol.Matic : tierCurrency;
	}, [isOpenSaleActive, isWhitelistSaleActive, isWhitelistVerified, tier.currency]);

	const priceTokenId = useMemo(() => {
		if (!tokenSymbol) return;

		return getTokenIdBySymbol(tokenSymbol);
	}, [tokenSymbol]);

	const unformattedPrice = useMemo(
		() => getSalePrice(isOpenSaleActive, isWhitelistSaleAvailable, tier.totalPrice) || '0',
		[isOpenSaleActive, isWhitelistSaleAvailable, tier.totalPrice]
	);

	const decimals = useMemo(() => getTokenDecimalsBySymbol(tokenSymbol), [tokenSymbol]);

	const price = useMemo(() => formatEthersPriceWithSymbol(unformattedPrice, decimals), [decimals, unformattedPrice]);

	const rates = useExchangeQuery(
		{ quoteCurrenciesIds: [FiatCoinMarketCapId.USD] },
		{ refetchInterval: 60 * 1000 } // 1 minute
	).data?.exchange;

	const { isWrongChain } = useCheckChain();

	const usdPrice = useMemo(() => {
		if (!price || !rates || !priceTokenId) {
			return 0;
		}
		const { rate } = rates.find(({ baseCurrencyId }) => baseCurrencyId === priceTokenId)!;
		const usdPrice = Number(price) * rate;

		return usdPrice < 1 ? Math.round(usdPrice * 100) / 100 : Math.round(usdPrice);
	}, [price, priceTokenId, rates]);

	const formattedPrice = `$${formatUsdValue(usdPrice)}`;

	const hasEnoughUnitsToBuy = useMemo(() => tier.maxAmount > tier.totalAmount, [tier.maxAmount, tier.totalAmount]);

	const isBuyAvailable = useMemo(
		() => Boolean(tier.salesActivity?.openSale || tier.salesActivity?.whitelistSale),
		[tier.salesActivity]
	);

	const handleNftCardClick = useCallback(() => {
		const tierId = encodeURIComponent(tier.id);

		push(`${slug}/${tierId}`).then();
	}, [push, slug, tier.id]);

	const redirectToCheckout = useRedirectToCheckout(slug, tier.id);

	const onBuyClick = useCallback(
		async (event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();

			if (isWhitelistSaleAvailable) {
				handleNftCardClick();
			} else {
				await redirectToCheckout();
			}
		},
		[handleNftCardClick, isWhitelistSaleAvailable, redirectToCheckout]
	);

	const CardAction = useMemo(() => {
		if (isLoading || isSaleLoading)
			return (
				<>
					<SkeletonComponent className="mt-2 rounded" width="100%" height={16} />
					<SkeletonComponent className="mt-2 rounded" width="100%" height={16} />
				</>
			);

		if (!isSaleActive) {
			return null;
		}

		if (!isBuyAvailable) {
			return <NftCardAction primaryPrice={formattedPrice} buttonText={t('components.nft.notAvailable')} isDisabled />;
		}

		if (!isOpenSaleActive && isWhitelistSaleActive && !isWhitelistVerified) {
			return <NftCardBottomDescription className="mt-0.5" content={t('components.nft.privateSale')} />;
		}

		if (hasEnoughUnitsToBuy) {
			return (
				<NftCardAction
					primaryPrice={formattedPrice}
					buttonText={t('components.nft.buy')}
					isDisabled={isWrongChain}
					onClick={onBuyClick}
				/>
			);
		}

		return <NftCardAction primaryPrice={formattedPrice} buttonText={t('components.nft.noUnits')} isDisabled />;
	}, [
		isLoading,
		isSaleLoading,
		isSaleActive,
		isBuyAvailable,
		isOpenSaleActive,
		isWhitelistSaleActive,
		isWhitelistVerified,
		hasEnoughUnitsToBuy,
		formattedPrice,
		t,
		isWrongChain,
		onBuyClick
	]);

	const artworkProps = useMemo(
		() => ({
			artworks: tier.artworks,
			artworksTotalLength: tier.artworksTotalLength,
			sliderProps: { isSlider: true }
		}),
		[tier.artworks, tier.artworksTotalLength]
	);

	return (
		<>
			<NftCard onClick={handleNftCardClick} artworkProps={artworkProps} data-testid={`NftCard__${tier.id}`}>
				{tier &&
					(isCollectionLoading ? (
						<SkeletonLoader />
					) : (
						<NftCardTierInfo tierArtworkType={tier.tierArtworkType} tier={tier} collectionName={collectionName} />
					))}
				<NftCardTitle className="mt-1" content={tier.tierName || tier.id} />

				{CardAction}
			</NftCard>
		</>
	);
};

export default memo(DaoNftCard);
