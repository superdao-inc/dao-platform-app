import { useEffect, useState, useCallback } from 'react';
import head from 'lodash/head';
import some from 'lodash/some';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import defaultTo from 'lodash/defaultTo';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import Blockies from 'react-blockies';
import { isAddress } from 'ethers/lib/utils';
import ERC721Contract from '@openzeppelin/contracts/build/contracts/ERC721.json';
import { ethers } from 'ethers';
import { config } from 'src/constants';
import { TxData } from 'src/services/gnosis';
import { useSafesList } from 'src/hooks/use-safes';
import { getAddress } from '@sd/superdao-shared';

import { CustomSelect } from 'src/components/customSelect';
import {
	CustomControl,
	ValueContainer,
	CustomOption,
	GroupHeading,
	SelectPlaceholder
} from 'src/pagesComponents/treasury/shared/transferSelectComponents';

import {
	walletSelectStyles,
	nftSelectStyles,
	modalStyles
} from 'src/pagesComponents/treasury/shared/transferSelectStyles';
import {
	Body,
	Button,
	Input,
	Label,
	Title1,
	toast,
	UserAvatar as WalletAvatar,
	CheckIcon,
	CrossIcon,
	Loader,
	WalletIcon,
	StackIcon,
	WarningInfoIcon
} from 'src/components';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { NftToastContent } from 'src/components/toast/nftToastContent';
import { TransferNftFields, transferNftSchema } from 'src/validators/transferNft';
import { WalletInfo } from 'src/pagesComponents/treasury/wallet/walletInfo';
import { useTransferTransaction } from 'src/hooks';
import { openExternal, getSafeAppTransactionUrl } from 'src/utils/urls';
import { ChainId, NftOpenseaMetadata, TreasuryWalletType } from 'src/types/types.generated';
import { Caption, Ellipsis, Label1, SubHeading } from '../text';
import { ArtworkView, ArtworkViewProps } from '../artwork';
import { colors } from 'src/style';
import { usePrivateTreasuryNftsQuery, useTreasuryQuery } from 'src/gql/treasury.generated';
import { useEstimateTxGas } from 'src/hooks/estimateSafeTxGas';
import { useSyncWalletMutation } from 'src/gql/wallet.generated';
import { useCheckChain } from 'src/hooks/useCheckChain';
import { networkMap } from 'src/pagesComponents/treasury/shared/constants';
import { useGetIsTiersTransferableQuery } from 'src/gql/walletNfts.generated';
import { SAFE_TRANSFER_FROM_WITHOUT_DATA_HASH } from 'src/pagesComponents/treasury/shared/constants';

type Props = BaseModalProps & {
	tokenId?: string;
	tokenAddress?: string;
	senderAddress: string;
	walletName?: string;
	artworkProps?: ArtworkViewProps;
	nftTitle?: string;
	collectionName?: string;
	chainId?: ChainId | null;
	metadata?: NftOpenseaMetadata[];
	daoId?: string;
	ownerOf?: string;
	currentNetwork?: number | null;
	isQuickActionsEnabled: boolean;
	refetchList?: () => void;
};

export const TreasuryTransferNftsModal = (props: Props) => {
	const {
		isOpen,
		ownerOf,
		tokenId,
		tokenAddress,
		senderAddress,
		walletName,
		artworkProps,
		nftTitle,
		collectionName,
		metadata,
		daoId,
		currentNetwork,
		isQuickActionsEnabled,
		chainId,
		onClose,
		refetchList
	} = props;

	const { t } = useTranslation();
	const [txData, setData] = useState('');
	const [isListLoading, setIsListLoading] = useState(false);
	const [isTxSimulationFailed, setIsTxSimulationFailed] = useState(false);
	const { mutate: syncWallet } = useSyncWalletMutation();

	const currentChain = chainId ? networkMap[chainId] : currentNetwork || undefined;
	const { isWrongChain } = useCheckChain(currentChain, isQuickActionsEnabled);

	const onFetchSafesError = useCallback(
		() => toast.error(t('errors.unknownServerError'), { position: 'bottom-center' }),
		[t]
	);

	const { safes: senderSafes, isLoading: isSafesListLoading } = useSafesList(senderAddress, onFetchSafesError);

	const {
		register,
		formState: { errors, isValid },
		handleSubmit,
		watch,
		control
	} = useForm<TransferNftFields>({
		resolver: zodResolver(transferNftSchema),
		defaultValues: {
			token: {
				address: defaultTo<string>(tokenAddress, ''),
				id: defaultTo<string>(tokenId, ''),
				tierName: defaultTo<string>(metadata && head(metadata) && head(metadata)?.name, '')
			},
			owner: defaultTo<string>(ownerOf, '')
		},
		mode: 'onChange'
	});
	const recipient = watch('recipient');
	const owner = watch('owner');
	const selectedToken = watch('token');

	const { data: treasuryData, isLoading: isDataLoading } = useTreasuryQuery(
		{
			daoId: defaultTo<string>(daoId, '')
		},
		{ enabled: !tokenAddress && daoId != undefined }
	);

	const { data: privateTreasuryNfts = [], isLoading: isNftsLoading } = usePrivateTreasuryNftsQuery(
		{ daoId: defaultTo<string>(daoId, '') },
		{
			keepPreviousData: true,
			select: (data) => data.treasury?.nfts,
			enabled: !tokenAddress && daoId != undefined,
			cacheTime: 0
		}
	);

	const nfts = treasuryData?.treasury?.nfts
		? [...treasuryData?.treasury?.nfts, ...privateTreasuryNfts]
		: privateTreasuryNfts;

	const wallets = treasuryData?.treasury?.wallets.filter(
		({ chainId, type, address }) =>
			chainId === ChainId.PolygonMainnet &&
			type === TreasuryWalletType.Safe &&
			some(nfts || [], (nft) => getAddress(nft.ownerOf) === getAddress(address))
	);

	const selectedWalletName = wallets?.find((wallet) => wallet.address === owner)?.name;

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

	const [isGasEstimationLoading, estimate] = useEstimateTxGas({
		onSuccess: (gas: number) => setIsTxSimulationFailed(gas === 0),
		onError: () => setIsTxSimulationFailed(true)
	});

	const selectedNft = nfts.find(({ tokenAddress }) => tokenAddress === selectedToken.address);

	const isSuperdaoNft = metadata?.some((data) => data?.attributes?.some((attr) => attr.traitType === 'Tier'));

	const nftsByWallet = nfts?.filter((nft) => getAddress(nft.ownerOf) === getAddress(owner));

	const nftData = nftsByWallet
		.filter((nft) => nft.metadata?.attributes?.some((attr) => attr.traitType === 'Tier'))
		.map((nft) => ({
			collectionAddress: getAddress(nft.tokenAddress) || '',
			tierName: nft.metadata?.name || '',
			id: nft.id
		}));

	const { data: nftTransferableData } = useGetIsTiersTransferableQuery(
		{
			nfts: nftData || [
				{
					collectionAddress: getAddress(selectedToken.address) || '',
					tierName: selectedToken.tierName,
					id: selectedNft?.id
				}
			]
		},
		{
			enabled: !isEmpty(nftData) || (Boolean(selectedToken.address) && isSuperdaoNft),
			select: (data) => data.getIsTiersTransferable
		}
	);

	const nftsOptions = nftsByWallet?.map(({ tokenId, metadata, name, tokenAddress, id }) => {
		const isTransferable = defaultTo<boolean>(
			find(nftTransferableData || [], ({ id: nftId }) => nftId === id)?.isTransferable,
			true
		);
		return {
			value: { address: tokenAddress, id: tokenId, tierName: defaultTo<string>(metadata?.name, '') },
			id: `${tokenAddress}_${tokenId}`,
			label: metadata?.name,
			description: `${name} · 1 unit`,
			isTransferable,
			isDisabled: !isTransferable,
			icon: (
				<ArtworkView
					artworks={metadata ? [metadata] : []}
					sliderProps={{ isSlider: true }}
					className="h-[48px] w-[48px]"
				/>
			),
			controlIcon: (
				<ArtworkView
					artworks={metadata ? [metadata] : []}
					sliderProps={{ isSlider: true }}
					className="h-[48px] w-[48px]"
				/>
			)
		};
	});

	const isTransferable = isSuperdaoNft
		? nftTransferableData?.find((nft) => nft.id === selectedToken.id)?.isTransferable
		: true;

	const provider = new ethers.providers.Web3Provider((window as any).ethereum, 'any');

	useEffect(() => {
		if (isAddress(recipient) && selectedToken.address) {
			const nftContract = new ethers.Contract(selectedToken.address, ERC721Contract.abi, provider.getSigner());

			const data = nftContract.interface.encodeFunctionData(`0x${SAFE_TRANSFER_FROM_WITHOUT_DATA_HASH}`, [
				owner,
				recipient,
				selectedToken.id
			]);

			setData(data);

			estimate({
				daoAddress: getAddress(owner) || '',
				data,
				tokenAddress: selectedToken.address
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [recipient, selectedToken, owner, isWrongChain]);

	const onTxSuccess = (txData: TxData) => {
		if (txData.isExecuted) {
			setIsListLoading(true);
			setTimeout(() => {
				syncWallet({ address: senderAddress });
				refetchList && refetchList();
				setIsListLoading(false);
				onClose();
				toast.success(<NftToastContent title={t('toasts.transferNft.success.title')} />, {
					position: 'bottom-center',
					duration: 1000 * 20
				});
			}, 5000);
		} else {
			toast.success(
				<NftToastContent
					title={t('toasts.transferFunds.success.title')}
					actionProps={{
						title: t('toasts.transferFunds.success.action'),
						onClick: () => openExternal(getSafeAppTransactionUrl(owner, txData.hash, 'matic'))
					}}
				/>,
				{
					position: 'bottom-center',
					duration: 1000 * 60
				}
			);
			onClose();
		}
	};

	const onTxError = () => {
		toast.error(t(t('toasts.transferFunds.failed')), {
			position: 'bottom-center',
			duration: 5000
		});
		onClose();
	};

	const [isLoading, transfer] = useTransferTransaction({ onError: onTxError, onSuccess: onTxSuccess });

	const handleFormSubmit = handleSubmit(({ recipient, owner, token }) => {
		transfer({
			daoAddress: getAddress(owner) || '',
			recipient,
			senderAddress: getAddress(senderAddress) || '',
			chainId: config.polygon.chainId,
			data: txData,
			tokenAddress: token.address
		});
	});

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<form onSubmit={handleFormSubmit} data-testid={'TransferNftsModal__form'}>
				<ModalContent className="flex flex-col">
					<Title1 data-testid={'TransferNftsModal__title'}>{t('components.treasury.transferNftModal.title')}</Title1>

					<WalletWrapper data-testid={'TransferNftsModal__walletWrapper'}>
						<Label className="mb-4">{t('components.treasury.transferNftModal.from')}</Label>
						{walletName && ownerOf ? (
							<div className="mb-8" data-testid={'TransferNftsModal__walletInfo'}>
								<WalletInfo name={walletName} address={ownerOf} />
							</div>
						) : (
							<Controller
								name="owner"
								control={control}
								rules={{ required: true }}
								render={({ field: { name, value, onChange, ref } }) => (
									<CustomSelect
										innerRef={ref}
										onChange={({ value: newValue }) => onChange(newValue?.value)}
										name={name}
										value={walletsOptions?.find((item) => item.value === value)}
										components={{ Option: CustomOption, Control: CustomControl, ValueContainer, GroupHeading }}
										isLoading={isSafesListLoading || isNftsLoading || isDataLoading}
										loadingMessage={() => <>Loading</>}
										placeholder={
											<SelectPlaceholder
												label={t('components.treasury.transferNftModal.walletSelectPlaceholder')}
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
												label: defaultTo<string>(t('components.treasury.transferNftModal.unavailableWallets'), ''),
												description: t('components.treasury.transferNftModal.unavailableWalletsDescription'),
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
					<div className="mb-4" data-testid={'TransferNftsModal__artworksWrapper'}>
						<Label className="mb-2">{t('components.treasury.transferNftModal.artwork')}</Label>
						{artworkProps ? (
							<>
								<div className="flex items-center gap-4" data-testid={'TransferNftsModal__artworksView'}>
									<ArtworkView {...artworkProps} className="h-[60px] w-[60px]" />
									<div>
										<Ellipsis as={Label1}>{nftTitle}</Ellipsis>
										<SubHeading color={colors.foregroundTertiary}>
											<Ellipsis>{`${collectionName} · 1 unit`}</Ellipsis>
										</SubHeading>
									</div>
								</div>
								{isSuperdaoNft && !isTransferable && (
									<Caption className="flex gap-1.5 pt-2 pl-4" color={colors.errorDefault}>
										<WarningInfoIcon fill={colors.errorDefault} />
										{t('components.treasury.transferNftModal.nonTransferableHint')}
									</Caption>
								)}
							</>
						) : (
							<>
								<Controller
									name="token"
									control={control}
									rules={{ required: true }}
									render={({ field: { name, value, onChange, ref } }) => (
										<CustomSelect
											innerRef={ref}
											onChange={({ value: newValue }) => onChange(newValue?.value)}
											isDisabled={!owner}
											name={name}
											value={nftsOptions?.find((item) => item.id === `${value.address}_${value.id}`)}
											components={{ Option: CustomOption, Control: CustomControl, ValueContainer, GroupHeading }}
											placeholder={
												<SelectPlaceholder
													label={t('components.treasury.transferNftModal.nftSelectPlaceholder')}
													icon={
														<SquareIconWrapper>
															<StackIcon width={20} height={20} fill={colors.foregroundSecondary} />
														</SquareIconWrapper>
													}
												/>
											}
											options={[
												{
													label: selectedWalletName,
													description: t('components.treasury.transferNftModal.nftOptionsDescription'),
													options: nftsOptions.filter((option) => option.isTransferable) || []
												},
												//@ts-ignore
												{
													label: t('components.treasury.transferNftModal.unavailableNfts'),
													description: t('components.treasury.transferNftModal.unavailableNftsDescription'),
													options: nftsOptions.filter((option) => !option.isTransferable) || []
												}
											]}
											styles={nftSelectStyles}
										/>
									)}
								/>
								{isSuperdaoNft && !isTransferable && (
									<Caption className="flex gap-1.5 pt-2 pl-4" color={colors.errorDefault}>
										<WarningInfoIcon fill={colors.errorDefault} />
										{t('components.treasury.transferNftModal.nonTransferableHint')}
									</Caption>
								)}
							</>
						)}
					</div>

					<Body data-testid={'TransferNftsModal__recipientWallet'}>
						<Input
							leftIcon={isAddress(recipient) && <WalletAvatar seed={recipient} size="xs" />}
							rightIcon={
								isAddress(recipient) &&
								(isGasEstimationLoading ? (
									<Loader />
								) : isTxSimulationFailed ? (
									<CrossIcon fill={colors.accentNegative} />
								) : (
									<CheckIcon fill={colors.accentPositive} />
								))
							}
							error={isTxSimulationFailed ? t('components.treasury.transferNftModal.error') : errors.recipient?.message}
							label={t('components.treasury.transferNftModal.recipient')}
							placeholder={t('components.treasury.transferFundsModal.recipientPlaceholder')}
							{...register('recipient')}
						/>
						<Caption className="pl-4 pt-2" color={colors.foregroundTertiary}>
							{isTxSimulationFailed
								? t('components.treasury.transferNftModal.error')
								: errors.recipient?.message || t('components.treasury.transferNftModal.hint')}
						</Caption>

						{/* <Textarea
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
								data-testid={'TransferNftsModal__cancelButton'}
							/>
							<Button
								size="lg"
								color="accentPrimary"
								label={t('components.treasury.transferNftModal.transfer')}
								type="submit"
								isLoading={isLoading || isListLoading}
								disabled={
									!isValid ||
									isEmpty(txData) ||
									isTxSimulationFailed ||
									isGasEstimationLoading ||
									(isQuickActionsEnabled && isWrongChain)
								}
								data-testid={'TransferNftsModal__transferButton'}
							/>
						</>
					}
				/>
			</form>
		</Modal>
	);
};

const WalletWrapper = styled.div`
	display: flex;
	flex-direction: column;
	margin: 16px 0 0;
`;

export const CircleIconWrapper = styled.div`
	display: inline-flex;
	padding: 10px;
	background-color: ${colors.overlayTertiary};
	border-radius: 50%;
`;

export const SquareIconWrapper = styled.div`
	display: inline-flex;
	padding: 14px;
	background-color: ${colors.overlayTertiary};
	border-radius: 6px;
`;
