/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import { Chain, getTokenDecimalsById, MATIC_TOKEN_ADDRESS, MATIC_TOKEN_ADDRESS_FOR_VIA } from '@sd/superdao-shared';

import { CurrentStep, NextStep, PrevStep, StepData } from '../components/steps';
import { useSwapCryptocurrency } from '../../internal/hooks/useSwapCryptocurrency';
import { getTransferAmount } from '../../internal/helpers/getTransferAmount';
import { useCheckoutFeatureContext } from '../../internal/components/featureProvider';
import { useCheckoutDataContext } from '../../internal/context/checkoutDataContext';
import { MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD } from '../../internal/constants';

import { toast } from 'src/components';

import { useChain } from 'src/hooks/useChain';
import { CurrentUserQuery } from 'src/gql/user.generated';
import { useCheckoutPaymentContext } from 'src/features/checkout/internal/context/checkoutPaymentContext';
import { usePaymentErrorHandler } from 'src/features/checkout/internal/hooks/nftPurchase/usePaymentErrorHandler';
import { useBuyNftWithAnyToken } from 'src/features/checkout/internal/hooks/nftPurchase/useBuyNftWithAnyToken';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';
import { CustomError } from '../../internal/namespace';
import { useCheckoutCommonContext } from '../../internal/context/checkoutCommonContext';

type PaymentStepsProps = {
	currentUser?: CurrentUserQuery['currentUser'];
	chainId: number;
	price: number;
	walletAddress: string;
	selectedTokenAddress: string;
	selectedTokenId: number;
	requiredToTokenAmount: string | undefined;
};

export const PaymentSteps = (props: PaymentStepsProps) => {
	const { currentUser, walletAddress, selectedTokenAddress, price, requiredToTokenAmount, selectedTokenId, chainId } =
		props;

	const { tier, kernelAddress } = useCheckoutDataContext();
	const { isViaEnabled } = useCheckoutFeatureContext();
	const { email: contextEmail } = useCheckoutCommonContext();
	const email = currentUser?.email ?? contextEmail;

	const { t } = useTranslation();

	const { chainId: currentNetwork, switchChain } = useChain();

	const [currentStep, setCurrentStep] = useState(0);
	const [isCurrentStepLoading, setIsCurrentStepLoading] = useState(false);

	const { setNeedsLeaveConfirm } = useCheckoutPaymentContext();
	const { navigation } = useCheckoutNavigationContext();
	const handleRequestError = usePaymentErrorHandler();

	const handlePaymentRequestError = usePaymentErrorHandler();

	const handleBuyNftSuccess = useCallback(() => {
		setNeedsLeaveConfirm(false);

		// Await setState changes
		setTimeout(() => navigation.toSuccess(), 0);
	}, [navigation, setNeedsLeaveConfirm]);

	const handleBuyNftError = useCallback(
		(err: unknown) => {
			setIsCurrentStepLoading(false);
			handlePaymentRequestError(err);
		},
		[handlePaymentRequestError]
	);

	const buyFromTokenAddress = chainId === Chain.Polygon ? selectedTokenAddress : MATIC_TOKEN_ADDRESS;
	const buyNft = useBuyNftWithAnyToken({
		email,
		tier,
		tokenAddress: buyFromTokenAddress,
		kernelAddress,
		onBuyNftSuccess: handleBuyNftSuccess,
		onError: handleBuyNftError
	});

	const { mutate: swapCryptocurrency } = useSwapCryptocurrency(
		() => {
			setIsCurrentStepLoading(false);
			setCurrentStep(currentStep + 1);
		},
		(error) => {
			setNeedsLeaveConfirm(false);
			handleRequestError(error);
		},
		requiredToTokenAmount
	);

	/**
	 * Steps configuration
	 */
	const switchToEthereumStep: StepData = {
		header: t('pages.checkout.finish.steps.switchToEthereum.header'),
		description: t('pages.checkout.finish.steps.switchToEthereum.description'),
		actionText: t('pages.checkout.finish.steps.switchToEthereum.action'),
		onActionClick: async () => {
			setIsCurrentStepLoading(true);

			try {
				await switchChain(Chain.Ethereum);

				setIsCurrentStepLoading(false);
				setCurrentStep(currentStep + 1);
				setNeedsLeaveConfirm(true);
			} catch (error) {
				handleRequestError(error as CustomError);
			}
		}
	};

	const transferTokenStep: StepData = {
		header: t('pages.checkout.finish.steps.transfer.header'),
		description: t('pages.checkout.finish.steps.transfer.description'),
		actionText: t('pages.checkout.finish.steps.transfer.action'),
		actionHint: t('pages.checkout.finish.steps.transfer.actionHint', {
			amount: MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD
		}),
		onActionClick: async () => {
			setIsCurrentStepLoading(true);
			setNeedsLeaveConfirm(true);

			const tokenDecimals = getTokenDecimalsById(selectedTokenId);

			if (!tokenDecimals) {
				toast.error(t('errors.unknownContractTokenParams'));
				return;
			}

			swapCryptocurrency({
				fromChainId: Chain.Ethereum,
				fromTokenAddress: selectedTokenAddress,
				fromAmount: getTransferAmount(price, tokenDecimals),
				toChainId: Chain.Polygon,
				toTokenAddress: MATIC_TOKEN_ADDRESS_FOR_VIA,
				owner: walletAddress
			});
		}
	};

	const payStep: StepData = {
		header: t('pages.checkout.finish.steps.pay.header'),
		description: t('pages.checkout.finish.steps.pay.description'),
		actionText: t('pages.checkout.finish.steps.pay.action'),
		onActionClick: async () => {
			setIsCurrentStepLoading(true);
			setNeedsLeaveConfirm(true);

			await buyNft();
		}
	};

	const steps: StepData[] = useMemo(() => {
		const steps = [];
		const shouldTransferFromEth = chainId === Chain.Ethereum;

		if (shouldTransferFromEth && isViaEnabled) {
			steps.push(switchToEthereumStep);
			steps.push(transferTokenStep);

			if (currentNetwork === Chain.Ethereum) {
				// Checking that first step is skipped if chain is ethereum
				if (currentStep === 0) setCurrentStep(1);
			}
		}

		steps.push(payStep);

		return steps;
	}, []);

	return (
		<>
			{steps.map((step, i) => {
				const isLastStep = i === steps.length - 1;

				if (i === currentStep) {
					return (
						<CurrentStep
							{...step}
							key={`${step.header}_${i}`}
							isLastStep={isLastStep}
							isLoading={isCurrentStepLoading}
						/>
					);
				}
				if (i > currentStep) {
					return <NextStep {...step} key={`${step.header}_${i}`} isLastStep={isLastStep} />;
				}

				return <PrevStep {...step} key={`${step.header}_${i}`} />;
			})}
		</>
	);
};
