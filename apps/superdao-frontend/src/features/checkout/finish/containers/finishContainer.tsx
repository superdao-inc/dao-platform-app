/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Chain, getTokenIdBySymbol, FiatCoinMarketCapId, getTokenAddressById } from '@sd/superdao-shared';

import { TwoTabsLayout } from '../../internal/components';
import { useNftAvailabilityCheck } from '../../internal/hooks/useNftAvailabilityCheck';
import { usePaymentQueryValidation } from '../../internal/hooks/usePaymentQueryValidation';
import { useEmailQueryValidation } from '../../internal/hooks/useEmailQueryValidation';
import { useCheckoutCommonContext } from '../../internal/context/checkoutCommonContext';
import { getChain } from '../../internal/helpers/getChain';
import { MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD } from '../../internal/constants';
import { useCheckoutDataContext } from '../../internal/context/checkoutDataContext';
import { PaymentSteps } from '../components/paymentSteps';
import { useCheckoutFeatureContext } from '../../internal/components/featureProvider';

import { Article2, Body, PageContent, PageLoader, toast } from 'src/components';
import { CustomHead } from 'src/components/head';
import { UserAPI } from 'src/features/user';
import { useExchangeQuery } from 'src/gql/exchange.generated';
import { useGetFinalPrice } from '../../internal/hooks/useGetFinalPrice';

export const FinishContainer = () => {
	const { tierInfo } = useCheckoutDataContext();
	const { isViaEnabled } = useCheckoutFeatureContext();
	const { email } = useCheckoutCommonContext();

	const { t } = useTranslation();
	const { query, back } = useRouter();
	const chain = typeof query.chain === 'string' ? query.chain : '';
	const tokenIdAsNumber = typeof query.tokenId === 'string' ? +query.tokenId : 0;

	/**
	 * common information
	 */
	const [isPriceCorrected, setIsPriceCorrected] = useState(false);

	useEffect(() => {
		const shouldTransferFromEth = getChain(chain) === Chain.Ethereum;

		if (isViaEnabled && shouldTransferFromEth && isPriceCorrected) {
			toast(t('pages.checkout.finish.minimumTransactionAmount', { amount: MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD }));
		}
	}, [isPriceCorrected]);

	const { data: currentUserData, isLoading: isUserDataLoading } = UserAPI.useCurrentUserQuery();
	const { currentUser } = currentUserData ?? {};

	/**
	 * validation
	 */
	const emailValidationResult = useEmailQueryValidation(currentUser?.email ?? email);

	const nftAvailabilityValidationResult = useNftAvailabilityCheck();
	const isNftAvailabilityCheckLoading = nftAvailabilityValidationResult?.isLoading;

	const paymentValidationError = usePaymentQueryValidation();

	/**
	 * tier information
	 */
	const finalPrice = useGetFinalPrice(tierInfo.totalPrice?.openSale, tierInfo.currency);

	const contractTokenId = getTokenIdBySymbol(tierInfo.currency);

	const { data: exchangeCommonCurrenciesData, isLoading: isExchangeCommonCurrenciesLoading } = useExchangeQuery(
		{ quoteCurrenciesIds: [contractTokenId!] },
		{ refetchInterval: 60 * 1000, enabled: !!contractTokenId } // 1 minute
	);
	const commonCurrenciesExchangeRates = exchangeCommonCurrenciesData?.exchange;

	/**
	 * loading information state
	 */
	const isComponentLoading = isNftAvailabilityCheckLoading || isUserDataLoading || isExchangeCommonCurrenciesLoading;

	if (isComponentLoading) {
		return (
			<PageContent columnSize="md" className="pt-3" onBack={back}>
				<CustomHead main={'NFT checkout finish'} additional={'Superdao'} description={'NFT checkout finish'} />

				<PageLoader />
			</PageContent>
		);
	}

	/**
	 * ORDER BELOW IS IMPORTANT
	 */

	if (nftAvailabilityValidationResult && !nftAvailabilityValidationResult.isValid) {
		const ValidationErrorModal = nftAvailabilityValidationResult.ErrorModal;
		return <ValidationErrorModal />;
	}

	if (emailValidationResult && !emailValidationResult.isValid) {
		const ValidationErrorModal = emailValidationResult.ErrorModal;
		return <ValidationErrorModal />;
	}

	if (paymentValidationError && !paymentValidationError.isValid) {
		const ValidationErrorModal = paymentValidationError.ErrorModal;
		return <ValidationErrorModal />;
	}

	/**
	 * tier information processing
	 */
	const chainId = getChain(chain) as Chain;

	const fromTokenAddress = getTokenAddressById(tokenIdAsNumber, chainId);

	const userWalletAddress = currentUser?.walletAddress;

	if (!contractTokenId) {
		toast.error(t('errors.unknownContractTokenId'));
		return null;
	}

	if (!finalPrice) {
		toast.error(t('errors.invalidPriceCalculation'), { id: 'toast_invalidPriceCalculation' });
		return null;
	}

	if (!fromTokenAddress) {
		toast.error(`${t('errors.unknownTokenId')} ${tokenIdAsNumber}`);
		return null;
	}

	if (!userWalletAddress) {
		toast.error(t('errors.walletAddressMissing'));
		return null;
	}

	/**
	 * tier rates in USD and contract currency
	 */
	const contractCurrencyUsdRate = commonCurrenciesExchangeRates?.find(
		(rate) => rate.quoteCurrencyId === contractTokenId && rate.baseCurrencyId === FiatCoinMarketCapId.USD
	)?.rate;

	const targetRate = commonCurrenciesExchangeRates?.find(
		(rate) => rate.quoteCurrencyId === contractTokenId && rate.baseCurrencyId === tokenIdAsNumber
	)?.rate;

	if (!targetRate || !contractCurrencyUsdRate) {
		toast.error(t('errors.invalidPriceCalculation'), { id: 'toast_invalidPriceCalculation' });
		return null;
	}

	const finalPriceInUsd = finalPrice / contractCurrencyUsdRate;

	/**
	 * 1 / targetRate is because of inverted rate from exchange query
	 */
	let finalPriceInRightCurrency = finalPrice / targetRate;

	/**
	 * if price is less than 100$ we increase amount to 100$ manually
	 */
	if (finalPriceInUsd < MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD) {
		if (!isPriceCorrected) setIsPriceCorrected(true);

		finalPriceInRightCurrency = finalPriceInRightCurrency * (MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD / finalPriceInUsd);
	}

	return (
		<TwoTabsLayout activeTabIndex={1}>
			<CustomHead main={'NFT checkout finish'} additional={'Superdao'} description={'NFT checkout finish'} />

			<Article2 className="mb-2">{t('pages.checkout.finish.heading')}</Article2>
			{chainId !== Chain.Polygon && (
				<Body className="text-foregroundSecondary mb-5">{t('pages.checkout.finish.description')}</Body>
			)}

			<PaymentSteps
				currentUser={currentUser}
				selectedTokenId={tokenIdAsNumber}
				selectedTokenAddress={fromTokenAddress}
				price={finalPriceInRightCurrency}
				requiredToTokenAmount={tierInfo.totalPrice?.openSale}
				chainId={chainId}
				walletAddress={userWalletAddress}
			/>
		</TwoTabsLayout>
	);
};
