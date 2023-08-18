import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';

import {
	Chain,
	FiatCoinMarketCapId,
	getTokenIdBySymbol,
	NATIVE_TOKEN_SYMBOLS,
	roundCryptoCurrency,
	tokensMap
} from '@sd/superdao-shared';

import { adjustPriceToStockChanges } from '../../internal/helpers/adjustPriceToStockChanges';
import { getUserBalance } from '../../internal/helpers/getUserBalance';

import { CurrencyInfo } from './currencyInfo';

import { useCheckoutFeatureContext } from 'src/features/checkout/internal/components/featureProvider';
import { Article2, Body, Button, Cell, DollarIcon, Loader, SubNavigationBar } from 'src/components';
import { useGetBalanceWithCovalentQuery } from 'src/gql/wallet.generated';
import { useExchangeQuery } from 'src/gql/exchange.generated';
import { UserAPI } from 'src/features/user';
import { EnrichedToken } from 'src/features/checkout/paymentSelection/namespace';
import { CurrencyList } from 'src/features/checkout/paymentSelection/components/currencyList';

import { useCheckoutDataContext } from 'src/features/checkout/internal/context/checkoutDataContext';
import { WinterFiatCheckoutModal } from 'src/features/winterFiatCheckout/winterFiatCheckout';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';
import { ActionButton } from 'src/features/checkout/paymentSelection/components/actionButton';
import { useBuyNftWithAnyToken } from 'src/features/checkout/internal/hooks/nftPurchase/useBuyNftWithAnyToken';
import { useCheckoutPaymentContext } from 'src/features/checkout/internal/context/checkoutPaymentContext';
import { useSwitch } from 'src/hooks';
import { usePaymentErrorHandler } from 'src/features/checkout/internal/hooks/nftPurchase/usePaymentErrorHandler';
import { CustomError } from 'src/features/checkout/internal/namespace';
import { useBuyNftOpenSaleMutation } from 'src/gql/nft.generated';

const networksImages = [
	'https://polygonscan.com/token/images/matic_32.png',
	'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
];

export type Props = {
	price: number;
	/**
	 * The symbol of the token (currency) the nft price is stored in.
	 * @example DAI
	 */
	priceTokenSymbol: string;

	showNavigationTabs(): void;
	hideNavigationTabs(): void;
};

export const PaymentSelection = (props: Props) => {
	const { price, priceTokenSymbol, showNavigationTabs, hideNavigationTabs } = props;

	const { t } = useTranslation();

	const { tier, tierInfo, kernelAddress } = useCheckoutDataContext();
	const { navigation } = useCheckoutNavigationContext();
	const { setNeedsLeaveConfirm } = useCheckoutPaymentContext();
	const { isFiatPaymentEnabled: isFiatPaymentEnabledFeatureToggle = false, isViaEnabled } = useCheckoutFeatureContext();

	const { winterFiatCheckoutProjectId } = tierInfo;

	const isFiatPaymentEnabled = isFiatPaymentEnabledFeatureToggle && winterFiatCheckoutProjectId !== null;

	const [chain, setChain] = useState<Chain>(Chain.Polygon);
	const [selectedToken, setSelectedToken] = useState<EnrichedToken | null>(null);
	const selectedTokenAddress = selectedToken?.tokenAddress;

	const [isFiatSelected, setIsFiatSelected] = useState(false);
	const [isFiatModalShown, setIsFiatModalShown] = useState(false);

	const [isPurchaseOnPolygonInProgress, { on: startPurchaseOnPolygon, off: stopPurchaseOnPolygon }] = useSwitch(false);

	const user = UserAPI.useCurrentUserQuery().data?.currentUser;
	const { walletAddress, email } = user || {};

	const { mutate: processBuyNftTx } = useBuyNftOpenSaleMutation<CustomError>();

	const handlePaymentRequestError = usePaymentErrorHandler();

	const handleFiatPaymentSuccess = useCallback(
		(transactionHash: string) => {
			processBuyNftTx(
				{
					buyNftData: {
						tier,
						daoAddress: kernelAddress,
						transactionHash
					}
				},
				{
					onError: handlePaymentRequestError
				}
			);
		},
		[processBuyNftTx, handlePaymentRequestError, tier, kernelAddress]
	);

	const handleBuyNftSuccess = useCallback(() => {
		setNeedsLeaveConfirm(false);

		// Await setState changes
		setTimeout(() => {
			navigation.toSuccess().then();
		}, 0);
	}, [navigation, setNeedsLeaveConfirm]);

	const handleBuyNftError = useCallback(
		(e: CustomError) => {
			stopPurchaseOnPolygon();
			handlePaymentRequestError(e);
		},
		[handlePaymentRequestError, stopPurchaseOnPolygon]
	);

	const buyNft = useBuyNftWithAnyToken({
		tier,
		tokenAddress: selectedTokenAddress || '',
		kernelAddress,
		onBuyNftSuccess: handleBuyNftSuccess,
		onError: handleBuyNftError
	});

	const priceTokenId = getTokenIdBySymbol(priceTokenSymbol);

	useEffect(() => {
		if (chain == Chain.Polygon) {
			hideNavigationTabs();
		} else {
			showNavigationTabs();
		}
	}, [chain, hideNavigationTabs, showNavigationTabs]);

	const rates = useExchangeQuery(
		{ quoteCurrenciesIds: [priceTokenId!] },
		{
			refetchInterval: 60 * 1000,
			enabled: Boolean(priceTokenId),
			onError: (error) => {}
		} // 1 minute
	).data?.exchange;

	const userPolygonTokens = useGetBalanceWithCovalentQuery(
		{ address: walletAddress!, chainId: Chain.Polygon },
		{
			enabled: walletAddress !== undefined,
			onError: (error) => {}
		}
	).data?.getBalanceWithCovalent;

	const userEthereumTokens = useGetBalanceWithCovalentQuery(
		{ address: walletAddress!, chainId: Chain.Ethereum },
		{
			enabled: walletAddress !== undefined && isViaEnabled,
			onError: (error) => {}
		}
	).data?.getBalanceWithCovalent;

	const [userTokens, selectedTokens] = useMemo(() => {
		switch (chain) {
			case Chain.Ethereum:
				return [userEthereumTokens, tokensMap[Chain.Ethereum]];

			case Chain.Polygon: {
				return [userPolygonTokens, tokensMap[Chain.Polygon]];
			}

			default:
				return [undefined, []];
		}
	}, [chain, userPolygonTokens, userEthereumTokens]);

	const usdPrice = useMemo(() => {
		if (!rates) return undefined;

		const rate = rates.find((token) => token.baseCurrencyId === FiatCoinMarketCapId.USD)?.rate || 1;

		return roundCryptoCurrency(price / rate);
	}, [rates, price]);

	const enrichedTokens = useMemo(() => {
		if (!rates || userTokens === undefined) return undefined;

		let enrichedTokens: EnrichedToken[] = [];

		for (const token of selectedTokens) {
			let tokenPrice: number | undefined;

			if (token.id === priceTokenId && chain === Chain.Polygon) {
				// Found token and the token the price is stored in are the same - no need to use rate.
				tokenPrice = price;
			} else {
				const rate = rates.find((exchangePair) => exchangePair.baseCurrencyId === token.id)?.rate;

				if (!rate) continue;
				tokenPrice = price / rate; // because, for example, we know that MATIC / DAI = rate, so 7 * DAI = 7 * MATIC / rate = 7 / rate = price / rate

				if (chain !== Chain.Polygon) {
					tokenPrice = adjustPriceToStockChanges(tokenPrice);
				}
			}

			let userBalance = 0;
			const userTokenBalance = userTokens.find((userToken) => userToken.symbol === token.symbol);
			if (userTokenBalance) userBalance = getUserBalance(userTokenBalance.balance, userTokenBalance.decimals);

			enrichedTokens.push({
				...token,
				price: roundCryptoCurrency(tokenPrice),
				userBalance: roundCryptoCurrency(userBalance)
			});
		}

		enrichedTokens = enrichedTokens.sort((oneToken, otherToken) => {
			return otherToken.userBalance / otherToken.price - oneToken.userBalance / oneToken.price;
		});

		return enrichedTokens;
	}, [rates, userTokens, selectedTokens, priceTokenId, chain, price]);

	const userBalanceInNativeToken = useMemo(() => {
		if (userTokens === undefined) return undefined;

		const currentNativeTokenSymbol = NATIVE_TOKEN_SYMBOLS[chain];

		const userNativeToken = userTokens.find((userToken) => userToken.symbol === currentNativeTokenSymbol);
		if (!userNativeToken) return 0;

		return getUserBalance(userNativeToken.balance, userNativeToken.decimals);
	}, [chain, userTokens]);

	const handleWinterFiatCheckoutClosed = useCallback(() => {
		setIsFiatModalShown(false);
	}, []);

	/**
	 * Resets fiat and token on chain change.
	 * Is useful for 'canContinuePayment' variable.
	 */
	const handleChangeChain = useCallback(
		(chain: Chain) => {
			setChain(chain);
			setIsFiatSelected(false);
			setSelectedToken(null);
		},
		[setChain, setIsFiatSelected, setSelectedToken]
	);

	const handleSwapToFiat = () => {
		hideNavigationTabs();
		setSelectedToken(null);
		setIsFiatSelected(!isFiatSelected);
	};

	const handleChooseCurrency = (token: EnrichedToken) => {
		return () => {
			setSelectedToken(token);
			setIsFiatSelected(false);
		};
	};

	const onContinue = useCallback(async () => {
		if (isFiatPaymentEnabled && isFiatSelected) {
			setIsFiatModalShown(true);
			return;
		}

		await navigation.toFinish({ tokenId: selectedToken?.id || 0, chain });
	}, [isFiatPaymentEnabled, isFiatSelected, navigation, selectedToken?.id, chain]);
	const canContinuePayment = isFiatSelected || selectedToken;

	const handlePayPolygonToken = useCallback(async () => {
		if (!selectedTokenAddress) return;

		startPurchaseOnPolygon();
		await buyNft();
	}, [buyNft, selectedTokenAddress, startPurchaseOnPolygon]);

	return (
		<>
			<Article2>{t('pages.checkout.choose.heading')}</Article2>
			<Body className={cn('text-foregroundSecondary', !isViaEnabled && 'mb-3')}>
				{isViaEnabled ? t('pages.checkout.choose.description') : t('pages.checkout.choose.descriptionNoEthereum')}
			</Body>
			{isViaEnabled && (
				<SubNavigationBar
					options={[
						{
							text: `Polygon network`,
							iconURI: networksImages[0] ?? '',
							isActive: chain === Chain.Polygon,
							onClick: () => handleChangeChain(Chain.Polygon)
						},
						{
							text: `Ethereum network`,
							iconURI: networksImages[1] ?? '',
							isActive: chain === Chain.Ethereum,
							onClick: () => handleChangeChain(Chain.Ethereum)
						}
					]}
				/>
			)}
			{enrichedTokens ? (
				<CurrencyList
					chain={chain}
					tokens={enrichedTokens}
					selectedTokenId={selectedToken?.id}
					priceTokenSymbol={priceTokenSymbol}
					handleChooseCurrency={handleChooseCurrency}
					userBalanceInNativeToken={userBalanceInNativeToken}
				/>
			) : (
				<div className="mt-2 flex w-full justify-center">
					<Loader size="xl" />
				</div>
			)}

			{isFiatPaymentEnabled && (
				<Cell
					onClick={handleSwapToFiat}
					className={`active:bg-overlayQuinary mt-3 h-fit rounded-lg pt-2 pb-2 transition-all lg:mt-5 ${
						isFiatSelected ? ' bg-overlayTertiary' : 'bg-backgroundSecondary hover:bg-overlaySecondary'
					}`}
					size="auto"
					before={
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
								isFiatSelected ? 'bg-backgroundSecondary' : 'bg-backgroundTertiary'
							}`}
						>
							<DollarIcon />
						</div>
					}
					label={t('pages.checkout.choose.fiat.heading')}
					description={t('pages.checkout.choose.fiat.description')}
					after={<CurrencyInfo count={usdPrice || 0} symbol="USD" isEqualSymbolShown />}
				/>
			)}

			<div className="mt-6 flex gap-2 lg:mt-8">
				{chain === Chain.Polygon ? (
					<ActionButton
						isLoading={isPurchaseOnPolygonInProgress}
						label={t('pages.checkout.pay')}
						onClick={handlePayPolygonToken}
						disabled={!selectedToken}
					/>
				) : (
					<ActionButton label={t('pages.checkout.continue')} onClick={onContinue} disabled={!canContinuePayment} />
				)}
				<Button
					size="lg"
					label={t('pages.checkout.back')}
					color="transparent"
					onClick={() => navigation.toNftCheckout()}
				/>
			</div>

			{isFiatPaymentEnabled && isFiatModalShown && (
				<>
					<div className=" fixed top-0 bottom-0 right-0 z-[99] flex h-screen	w-screen items-center justify-center   ">
						<Loader size="40" />
					</div>
					<WinterFiatCheckoutModal
						projectId={winterFiatCheckoutProjectId}
						tierPreviewImage={tierInfo.artworks[0].image || ''}
						tierId={tier}
						email={email}
						walletAddress={walletAddress}
						onClose={handleWinterFiatCheckoutClosed}
						onPaymentSucceed={handleFiatPaymentSuccess}
					/>
				</>
			)}
		</>
	);
};
