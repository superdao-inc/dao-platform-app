import { useTranslation } from 'next-i18next';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAddress } from 'ethers/lib/utils';
import { ToastPosition } from 'react-hot-toast';
import Blockies from 'react-blockies';

import isNil from 'lodash/isNil';
import defaultTo from 'lodash/defaultTo';
import { ethers } from 'ethers';
import ERC20Contract from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { TxData } from 'src/services/gnosis';
import { config } from 'src/constants';
import {
	walletSelectStyles,
	modalStyles,
	assetSelectStyles
} from 'src/pagesComponents/treasury/shared/transferSelectStyles';
import { CommonWalletFragment, useTreasuryQuery } from 'src/gql/treasury.generated';

import { CheckIcon, CrossIcon, WalletIcon, WarningInfoIcon } from 'src/components/assets/icons';
import { CustomSelect, DefaultSelectProps } from 'src/components/customSelect';
import {
	Body,
	Button,
	Input,
	Label,
	Spacer,
	Title1,
	toast,
	UserAvatar as WalletAvatar,
	Loader,
	Caption
} from 'src/components';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { LabelWrapper } from 'src/components/labelWrapper';
import { NftToastContent } from 'src/components/toast/nftToastContent';
import { TransferFundsFields, transferFundsSchema } from 'src/validators/transferFunds';
import { WalletInfo } from 'src/pagesComponents/treasury/wallet/walletInfo';
import { LabelWithMaxSelect } from 'src/pagesComponents/treasury/labelWithMaxSelect';
import { useTransferTransaction } from 'src/hooks';
import { getFormattedToken } from 'src/utils/getFormattedToken';
import { getParsedUnitsValue } from 'src/utils/getParsedUnitsValue';
import { openExternal, getSafeAppTransactionUrl } from 'src/utils/urls';
import { getAddress } from '@sd/superdao-shared';
import { networkMap } from 'src/pagesComponents/treasury/shared/constants';
import { ChainId, TreasuryWalletType } from 'src/types/types.generated';

import { colors } from 'src/style';
import { useSyncWalletMutation } from 'src/gql/wallet.generated';
import { useCheckChain } from 'src/hooks/useCheckChain';
import {
	CustomControl,
	ValueContainer,
	CustomOption,
	GroupHeading,
	SelectPlaceholder
} from 'src/pagesComponents/treasury/shared/transferSelectComponents';
import { useSafesList } from 'src/hooks/use-safes';
import { useEstimateTxGas } from 'src/hooks/estimateSafeTxGas';
import { EMPTY_DATA } from 'src/pagesComponents/treasury/shared/constants';

type Props = BaseModalProps & {
	wallet?: CommonWalletFragment;
	initialValue: TreasuryTransferFundsModalInitialValue | null;
	senderAddress: string;
	chainId: string;
	isQuickActionsEnabled: boolean;
	daoId?: string;
};

//TODO move networks service to shared and use here for mapping
const nativeTokensSymbols: {
	[key in string]: string;
} = {
	'137': 'MATIC',
	'56': 'BNB',
	'1': 'ETH'
};

//TODO move networks service to shared and use here for mapping
const chains: {
	[key in string]: string;
} = {
	'137': 'matic',
	'1': 'eth',
	'56': 'bnb'
};

export interface TreasuryTransferFundsModalInitialValue {
	symbol?: string;
	address?: string;
}

export const TreasuryTransferFundsModalContext = createContext<{ isOpen: boolean; off: Function; on: Function }>({
	isOpen: false,
	off: () => {},
	on: (initialValue: TreasuryTransferFundsModalInitialValue) => initialValue
});

export const TreasuryTransferFundsModal = (props: Props) => {
	const { isOpen, onClose, wallet, initialValue, senderAddress, chainId, isQuickActionsEnabled, daoId } = props;

	const { data: treasuryData, isLoading: isDataLoading } = useTreasuryQuery(
		{
			daoId: defaultTo<string>(daoId, '')
		},
		{ enabled: !isNil(daoId) }
	);

	const { t } = useTranslation();
	const { mutate: syncWallet } = useSyncWalletMutation();
	const [txData, setData] = useState('');
	const [isTxSimulationFailed, setIsTxSimulationFailed] = useState(false);

	const {
		register,
		formState: { errors, isValid },
		handleSubmit,
		watch,
		setValue,
		control
	} = useForm<TransferFundsFields>({
		defaultValues: {
			token: { symbol: initialValue?.symbol, address: initialValue?.address },
			wallet: defaultTo<string>(wallet?.address, '')
		},
		resolver: zodResolver(transferFundsSchema),
		mode: 'onChange'
	});

	const token = watch('token');
	const recipient = watch('recipient');
	const walletAddress = watch('wallet');
	const amount = watch('amount');
	const onFetchSafesError = useCallback(
		() => toast.error(t('errors.unknownServerError'), { position: 'bottom-center' }),
		[t]
	);
	const isSendingNativeToken = token.symbol === nativeTokensSymbols[chainId];

	const [isGasEstimationLoading, estimate] = useEstimateTxGas({
		onSuccess: (gas: number) => setIsTxSimulationFailed(gas === 0),
		onError: () => setIsTxSimulationFailed(true)
	});

	const { isWrongChain } = useCheckChain(networkMap[chainId], isQuickActionsEnabled);

	const provider = new ethers.providers.Web3Provider((window as any).ethereum, 'any');

	useEffect(() => {
		if (isAddress(recipient) && token.address && amount) {
			const parsedAmount = getParsedUnitsValue(
				amount,
				tokensBalance?.find((walletToken) => walletToken.token.symbol === token.symbol)?.token.decimals
			);

			if (!isSendingNativeToken) {
				const contract = new ethers.Contract(token.address, ERC20Contract.abi, provider.getSigner());
				const data = contract.interface.encodeFunctionData('transfer', [getAddress(recipient), parsedAmount]);

				setData(data);

				estimate({
					daoAddress: getAddress(walletAddress) || '',
					data,
					tokenAddress: getAddress(token.address) || ''
				});
			} else {
				setData(EMPTY_DATA);
				estimate({
					daoAddress: getAddress(walletAddress) || '',
					data: EMPTY_DATA,
					tokenAddress: getAddress(token.address) || '',
					amount: parsedAmount,
					to: getAddress(recipient) || ''
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [recipient, token, walletAddress, isWrongChain, amount]);

	const { safes: senderSafes, isLoading: isSafesListLoading } = useSafesList(senderAddress, onFetchSafesError);

	const wallets = treasuryData?.treasury?.wallets.filter(
		({ chainId, type }) => chainId === ChainId.PolygonMainnet && type === TreasuryWalletType.Safe
	);

	const walletsOptions = isSafesListLoading
		? []
		: wallets?.map(({ address, name }) => {
				const isAvailable = senderSafes.find((safe) => safe.address === address);

				return {
					value: address,
					label: name,
					description: address,
					icon: <Blockies className="before cursor-pointer  rounded-full" size={10} seed={address || ''} />,
					controlIcon: <Blockies className="before cursor-pointer  rounded-full" size={10} seed={address || ''} />,
					isDisabled: !isAvailable,
					isAvailable
				};
		  });

	const selectedWallet = wallets?.find((wallet) => getAddress(wallet.address) === getAddress(walletAddress));
	const tokensBalance = wallet ? wallet.tokensBalance : selectedWallet?.tokensBalance;

	useEffect(() => {
		setValue('amount', 0, { shouldValidate: true });
	}, [setValue, token.symbol]);

	const selectedToken = tokensBalance?.find(({ token: { symbol } }) => symbol === token.symbol);

	const maxAvailableAmount = useMemo(() => selectedToken?.amount ?? null, [selectedToken]);
	useEffect(() => {
		setValue('_availableAmount', getFormattedToken(maxAvailableAmount, selectedToken?.token.decimals), {
			shouldValidate: true
		});
	}, [setValue, maxAvailableAmount, selectedToken?.token.decimals]);

	const handleOnMaxSelect = useCallback(() => {
		setValue('amount', getFormattedToken(maxAvailableAmount, selectedToken?.token.decimals), { shouldValidate: true });
	}, [setValue, maxAvailableAmount, selectedToken]);

	const assetsOptions: DefaultSelectProps[] =
		tokensBalance?.map(({ amount, token }) => ({
			value: { symbol: token.symbol, address: token.address },
			label: token.name,
			description: `${getFormattedToken(amount, token.decimals)} ${token.symbol}`,
			icon: <Img src={token.iconUrl || '/assets/unknown-asset.png'} />,
			controlIcon: <ControlImg src={token.iconUrl || '/assets/unknown-asset.png'} />
		})) || [];

	const onTxSuccess = ({ hash, isExecuted }: TxData) => {
		const toastConfig = {
			title: isExecuted ? t('toasts.transferFunds.success.title') : t('toasts.transferFunds.success.title'),
			options: {
				position: 'bottom-center' as ToastPosition,
				duration: isExecuted ? 1000 * 20 : 1000 * 60
			},
			...(!isExecuted && {
				actionProps: {
					title: t('toasts.transferFunds.success.action'),
					onClick: () => openExternal(getSafeAppTransactionUrl(wallet?.address || walletAddress, hash, chains[chainId]))
				}
			})
		};

		if (isExecuted) {
			syncWallet({ address: senderAddress });
		}

		toast.success(
			<NftToastContent title={toastConfig.title} actionProps={toastConfig.actionProps} />,
			toastConfig.options
		);

		onClose();
	};

	const onTxError = () => {
		toast.error(t(t('toasts.transferFunds.failed')), {
			position: 'bottom-center',
			duration: 5000
		});
		onClose();
	};

	const [isLoading, transfer] = useTransferTransaction({ onError: onTxError, onSuccess: onTxSuccess });

	const handleFormSubmit = handleSubmit(({ recipient, amount, token }) => {
		const address = getAddress(senderAddress);

		if (!address) return;

		transfer({
			daoAddress: defaultTo<string>(getAddress(walletAddress), ''),
			recipient: defaultTo<string>(getAddress(recipient), ''),
			senderAddress: address,
			chainId: config.polygon.chainId,
			data: txData,
			tokenAddress: token.address || '',
			amount: getParsedUnitsValue(
				amount,
				tokensBalance?.find((walletToken) => walletToken.token.symbol === token.symbol)?.token.decimals
			)
		});
	});

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<form onSubmit={handleFormSubmit} data-testid={'TransferFundsModal__form'}>
				<ModalContent className="flex flex-col">
					<Title1 data-testid={'TransferFundsModal__title'}>{t('components.treasury.transferFundsModal.title')}</Title1>

					<WalletWrapper data-testid={'TransferFundsModal__walletWrapper'}>
						<LabelWithMaring>{t('components.treasury.transferFundsModal.from')}</LabelWithMaring>
						{wallet ? (
							<div className="mb-8" data-testid={'TransferFundsModal__walletInfo'}>
								<WalletInfo name={wallet.name} address={wallet.address} type={wallet.type} />
							</div>
						) : (
							<Controller
								name="wallet"
								control={control}
								rules={{ required: true }}
								render={({ field: { name, value, onChange, ref } }) => (
									<CustomSelect
										innerRef={ref}
										onChange={({ value: newValue }) => onChange(newValue?.value)}
										name={name}
										value={walletsOptions?.find((item) => item.value === value)}
										components={{ Option: CustomOption, Control: CustomControl, ValueContainer, GroupHeading }}
										isLoading={isSafesListLoading || isDataLoading}
										loadingMessage={() => <>Loading</>}
										placeholder={
											<SelectPlaceholder
												label={t('components.treasury.transferFundsModal.walletSelectPlaceholder')}
												icon={
													<CircleIconWrapper>
														<WalletIcon width={20} height={20} fill={colors.foregroundSecondary} />
													</CircleIconWrapper>
												}
											/>
										}
										options={[
											{
												options: walletsOptions?.filter((option) => option.isAvailable) || []
											},
											//@ts-ignore
											{
												label: defaultTo<string>(t('components.treasury.transferFundsModal.unavailableWallets'), ''),
												description: t('components.treasury.transferFundsModal.unavailableWalletsDescription'),
												options: walletsOptions?.filter((option) => !option.isAvailable) || []
											}
										]}
										isDisabled={isDataLoading}
										styles={walletSelectStyles}
										className="mb-4"
									/>
								)}
							/>
						)}
					</WalletWrapper>

					<Body data-testid={'TransferFundsModal__recipientWallet'}>
						<Input
							leftIcon={isAddress(recipient) && <WalletAvatar seed={recipient} size="xs" />}
							rightIcon={isAddress(recipient) && <CheckIcon fill={colors.accentPositive} />}
							error={errors.recipient?.message}
							label={t('components.treasury.transferFundsModal.recipient')}
							placeholder={t('components.treasury.transferFundsModal.recipientPlaceholder')}
							{...register('recipient')}
						/>

						<Spacer height={32} />

						<div className="mb-16 flex" data-testid={'TransferFundsModal__assetsWallet'}>
							<LabelWrapper label={t('components.treasury.transferFundsModal.asset')}>
								<Controller
									name="token"
									control={control}
									rules={{ required: true }}
									render={({ field: { name, value, onChange, ref } }) => (
										<CustomSelect
											innerRef={ref}
											onChange={({ value: newValue }) => onChange(newValue?.value)}
											name={name}
											value={assetsOptions.find((item) => item.value.address === value.address)}
											components={{ Option: CustomOption, Control: CustomControl }}
											options={assetsOptions}
											styles={assetSelectStyles}
										/>
									)}
								/>
							</LabelWrapper>

							<Spacer width={16} />

							<LabelWithMaxSelect
								label={t('components.treasury.transferFundsModal.amount')}
								maxAvailable={getFormattedToken(maxAvailableAmount, selectedToken?.token.decimals)}
								onMaxSelect={handleOnMaxSelect}
							>
								<Input
									error={errors.amount?.message}
									disabled={!maxAvailableAmount}
									rightIcon={
										amount && !errors.amount?.message ? (
											isGasEstimationLoading ? (
												<Loader />
											) : isTxSimulationFailed ? (
												<CrossIcon fill={colors.accentNegative} />
											) : (
												<CheckIcon fill={colors.accentPositive} />
											)
										) : null
									}
									{...register('amount', {
										required: true,
										valueAsNumber: true
									})}
								/>
								<Caption className="flex h-[26px] gap-1.5 pl-4 pt-2" color={colors.errorDefault}>
									{Boolean(amount) && !errors.amount?.message ? (
										isTxSimulationFailed && !isGasEstimationLoading ? (
											<>
												<WarningInfoIcon fill={colors.errorDefault} />
												{t('components.treasury.transferFundsModal.txSimulationError')}
											</>
										) : isWrongChain ? (
											<>
												<WarningInfoIcon fill={colors.errorDefault} />
												{t('components.treasury.transferFundsModal.wrongChain')}
											</>
										) : (
											<></>
										)
									) : (
										<></>
									)}
								</Caption>
							</LabelWithMaxSelect>
						</div>

						{/* <Textarea
							error={errors.description?.message}
							label={t('components.treasury.transferFundsModal.description')}
							placeholder={t('components.treasury.transferFundsModal.optional')}
							disableMinHeight
							rows={2}
							{...register('description')}
						/> */}
					</Body>
				</ModalContent>

				<ModalFooter
					right={
						<>
							<Button
								size="lg"
								color="transparent"
								label={t('actions.labels.cancel')}
								onClick={onClose}
								data-testid={'TransferFundsModal__cancelButton'}
							/>
							<Button
								size="lg"
								color="accentPrimary"
								label={t('components.treasury.transfer')}
								onClick={handleFormSubmit}
								disabled={!isValid || isWrongChain || isTxSimulationFailed || isGasEstimationLoading}
								isLoading={isLoading}
								data-testid={'TransferFundsModal__transferButton'}
							/>
						</>
					}
				/>
			</form>
		</Modal>
	);
};

const LabelWithMaring = styled(Label)`
	margin-bottom: 14px;
`;

const WalletWrapper = styled.div`
	display: flex;
	flex-direction: column;
	margin: 16px 0 0;
`;

const ControlImg = styled.img`
	width: 24px;
	height: 24px;
	object-fit: contain;
	border-radius: 50%;
`;

const Img = styled.img`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
	object-position: center;
`;

export const CircleIconWrapper = styled.div`
	display: inline-flex;
	padding: 10px;
	background-color: ${colors.overlayTertiary};
	border-radius: 50%;
`;
