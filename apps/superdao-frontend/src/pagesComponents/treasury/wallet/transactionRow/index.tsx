import cn from 'classnames';
import copy from 'clipboard-copy';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { DateTime } from 'luxon';
import find from 'lodash/find';

import { getOptimizedFileUrl } from 'src/utils/upload';
import { getAddress } from '@sd/superdao-shared';
import { openExternal } from 'src/utils/urls';
import { useToggle, useSwitch } from 'src/hooks';
import { Body, Caption, IconButton, Label1, SubHeading, toast, UserAvatar } from 'src/components';
import { ExternalLinkIcon } from 'src/components/assets/icons/externalLink';
import { shrinkWallet } from '@sd/superdao-shared';
import { formatUnitsValue } from 'src/utils/formattes';
import { getWalletTransactionTypeTranslationKey } from 'src/utils/walletTransaction';
import { CopyIcon, ContractIcon, ChevronIcon } from 'src/components/assets/icons';
import {
	WalletTransactionDirection,
	WalletTransactionType,
	WalletTransaction,
	NetworkEntity
} from 'src/types/types.generated';
import { PublicDaoMembershipFragment } from 'src/gql/daoMembership.generated';
import { colors } from 'src/style';

import { DirectionTransferParts } from './directionTransferParts';
import { TransferPart } from './transferPart';
import { ChangeMetaModal } from '../modal';
import { WalletsNameQuery } from 'src/gql/wallet.generated';

type Props = {
	walletId: string;
	walletName: string;
	walletAddress: string;
	isCreator: boolean;
	daoMembers: PublicDaoMembershipFragment[];
	tx: WalletTransaction;
	network?: NetworkEntity;
	walletsName: WalletsNameQuery['walletsName'];
};

type TransactionActionObjectBase = {
	type: 'member' | 'wallet' | 'unknown';
	displayName: string | undefined | null;
	walletAddress: string;
};

type TransactionActionObjectUnknown = TransactionActionObjectBase & {
	type: 'unknown';
};

type TransactionActionObjectMember = TransactionActionObjectBase & {
	type: 'member';
	daoMember: PublicDaoMembershipFragment;
};

type TransactionActionObjectWallet = TransactionActionObjectBase & {
	type: 'wallet';
	wallet: {
		name: string;
	};
};

type TransactionActionObject =
	| TransactionActionObjectMember
	| TransactionActionObjectWallet
	| TransactionActionObjectUnknown;

//TODO create separate TransactionRow component for each transaction type
export const TransactionRow: React.FC<Props> = ({
	walletId,
	walletName,
	walletAddress,
	isCreator,
	tx,
	daoMembers,
	network,
	walletsName
}) => {
	const { ecosystem, chainId, hash, parts, type, description, executed, gasFee, direction } = tx;
	const [isMetaVisible, toggleMeta] = useToggle();
	const router = useRouter();

	const { t } = useTranslation();

	const handleCopy = (event: React.MouseEvent<HTMLButtonElement>, address: string) => {
		event.stopPropagation();
		copy(address).then(() => toast(t('actions.confirmations.addressCopy'), { id: `address-${address}-copy` }));
	};

	const handleOpenBlockExplorer = (event: React.MouseEvent<HTMLButtonElement>, address: string, isTx: boolean) => {
		event.stopPropagation();
		const blockExplorerUrl = !network ? 'https://polygonscan.com' : network.blockExplorerUrl;

		isTx ? openExternal(`${blockExplorerUrl}/tx/${hash}`) : openExternal(`${blockExplorerUrl}/address/${address}`);
	};

	const handleClickActionEntity = (event: React.MouseEvent<HTMLSpanElement>, actionEntity: TransactionActionObject) => {
		event.stopPropagation();

		if (actionEntity.type === 'member') {
			router.push(`/users/${actionEntity.daoMember.user.id}`);
		}
	};

	const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (isCreator) openModal();
	};

	const [isModalOpen, { on: openModal, off: closeModal }] = useSwitch(false);
	const [meta, setMeta] = useState(description);

	const getActionObject = (
		address: string | null | undefined,
		daoMembers: PublicDaoMembershipFragment[],
		walletsName: WalletsNameQuery['walletsName']
	): TransactionActionObject => {
		const treasuryWallet = find(
			walletsName,
			(wallet) => (getAddress(wallet.address) || '') === (getAddress(address) || '')
		);
		if (treasuryWallet) {
			return {
				type: 'wallet',
				displayName: treasuryWallet.name,
				walletAddress: address || '',
				wallet: {
					name: walletName
				}
			};
		}

		const daoMember = find(
			daoMembers,
			({ user }) => (getAddress(user.walletAddress) || '') === (getAddress(address) || '')
		);

		if (daoMember) {
			return {
				type: 'member',
				displayName: daoMember.user.displayName,
				walletAddress: address || '',
				daoMember
			};
		}

		if (getAddress(address) === getAddress(walletAddress)) {
			return {
				type: 'wallet',
				displayName: walletName,
				walletAddress: address || '',
				wallet: {
					name: walletName
				}
			};
		}

		return {
			type: 'unknown',
			displayName: null,
			walletAddress: address || ''
		};
	};

	const senderActionObject = getActionObject(
		parts && parts[0] ? parts[0].from.address : tx.fromAddress,
		daoMembers,
		walletsName
	);
	const receiverActionObject = getActionObject(
		parts && parts[0] ? parts[0]?.to.address : tx.toAddress,
		daoMembers,
		walletsName
	);

	const actionObjectByType = {
		[WalletTransactionType.Execution]: getActionObject(tx.fromAddress, daoMembers, walletsName),
		[WalletTransactionType.Sell]: getActionObject(tx.fromAddress, daoMembers, walletsName),
		[WalletTransactionType.Receive]: senderActionObject,
		[WalletTransactionType.Send]: receiverActionObject,
		[WalletTransactionType.ReceiveNft]: senderActionObject,
		[WalletTransactionType.SendNft]: receiverActionObject,
		[WalletTransactionType.SafeSetup]: getActionObject(tx.fromAddress, daoMembers, walletsName)
	};

	const actionObject = actionObjectByType[type];

	const executedTime = DateTime.fromISO(executed).setLocale('en-US');
	const executedDate = DateTime.fromISO(executed).setLocale('en-US').toFormat('dd MMM yyyy');

	const outgoing = parts?.filter(({ direction }) => direction === WalletTransactionDirection.Out);
	const incoming = parts?.filter(({ direction }) => direction === WalletTransactionDirection.In);

	const getActionObjectTitle = (actionObject: TransactionActionObject) => {
		if (actionObject.type === 'member') {
			return actionObject.daoMember.user.displayName || shrinkWallet(actionObject.daoMember.user.walletAddress);
		} else {
			const address = direction === WalletTransactionDirection.Out ? tx.fromAddress : tx.toAddress;

			return address ? shrinkWallet(address) : 'unknown';
		}
	};

	return (
		<>
			<Body className={getRowClass(isMetaVisible)} onClick={toggleMeta} data-testid={'TransactionRow__wrapper'}>
				{actionObject && type !== WalletTransactionType.Execution ? (
					<UserAvatar
						size="md"
						src={
							actionObject.type === 'member' && actionObject.daoMember.user.avatar
								? getOptimizedFileUrl(actionObject.daoMember.user.avatar)
								: undefined
						}
						seed={actionObject.walletAddress}
					/>
				) : (
					<div
						className="bg-overlayTertiary col-start-1 col-end-2 row-start-1 row-end-2 flex h-10 w-10 items-center justify-center rounded-full"
						data-testid={'TransactionRow__contractIcon'}
					>
						<ContractIcon />
					</div>
				)}

				<Body className="col-start-2 col-end-5 row-start-1 row-end-2">
					<Label1
						className="line-clamp-1 overflow-hidden text-ellipsis text-left capitalize"
						data-testid={`TransactionRow__${getActionObjectTitle(actionObject)}`}
					>
						{getActionObjectTitle(actionObject)}
					</Label1>
					<Caption
						color={colors.foregroundSecondary}
						className="capitalize"
						data-testid={'TransactionRow__transactionType'}
					>
						{t(getWalletTransactionTypeTranslationKey(type))}
					</Caption>
				</Body>

				<Body
					className="col-start-5 col-end-10 row-start-1 row-end-2 flex items-center"
					data-testid={'TransactionRow__transferWrapper'}
				>
					{outgoing && outgoing?.length > 0 && (
						<div className="align-center col-span-2 flex" data-testid={'TransactionRow__outgoingTransfer'}>
							<DirectionTransferParts parts={outgoing} />
						</div>
					)}

					{outgoing && outgoing?.length > 0 && incoming && incoming?.length > 0 && (
						<ChevronIcon fill="#465065" className="ml-2 mr-2 self-center" />
					)}

					{incoming && incoming?.length > 0 && (
						<div className="align-center col-span-2 flex" data-testid={'TransactionRow__incomingTransfer'}>
							<DirectionTransferParts parts={incoming} />
						</div>
					)}
				</Body>
				<Body
					className="col-start-10 col-end-13 row-start-1 row-end-2 my-auto mr-4 text-right"
					data-testid={'TransactionRow__executeDate'}
				>
					<SubHeading color={colors.foregroundSecondary}>
						<div>{`${executedDate}, ${executedTime.toLocaleString(DateTime.TIME_SIMPLE)}`}</div>
					</SubHeading>
				</Body>
				{isMetaVisible && (
					<Body
						className="col-start-2 col-end-13 row-start-2 row-end-4 mr-4 text-left"
						data-testid={'TransactionRow__metaWrapper'}
					>
						<div className={getSeparatorClass()} />

						{parts && parts.length > 1 && (
							<div className="mb-2 max-w-fit">
								<div className="mt-2 mb-1 grid grid-cols-3">
									<SubHeading className="col-span-1 pb-5 text-center capitalize">
										{t('components.treasury.outgoing')}
									</SubHeading>
									{outgoing && outgoing?.length > 0 && (
										<>
											<div className="col-span-1 col-start-1 flex flex-col">
												{outgoing?.map((part) => (
													<div key={part.token.address} className="mb-2">
														<TransferPart part={part} />
													</div>
												))}
											</div>
											<ChevronIcon
												fill="#465065"
												className="col-span-1 col-start-2 row-start-2 mr-0.5 self-center justify-self-center"
											/>
										</>
									)}
									<SubHeading className="col-span-1 col-start-3 row-start-1 pb-5 text-center capitalize">
										{t('components.treasury.incoming')}
									</SubHeading>
									{incoming && incoming.length > 0 && (
										<>
											<div className="col-span-1 col-start-3 flex flex-col ">
												{incoming?.map((part) => (
													<div key={part.token.address} className="mb-2">
														<TransferPart part={part} />
													</div>
												))}
											</div>
										</>
									)}
								</div>
							</div>
						)}
						<div className="grid grid-cols-10" data-testid={'TransactionRow__metaDescriptionWrapper'}>
							<SubHeading className="col-span-2" data-testid={'TransactionRow__metaDescriptionTitle'}>
								{t('components.treasury.description')}
							</SubHeading>
							<SubHeading
								onClick={handleOpenModal}
								style={{ color: `${meta ? colors.foregroundSecondary : colors.accentPrimary}` }}
								className="line-clamp-2 col-span-8 overflow-hidden text-ellipsis"
								data-testid={'TransactionRow__metaAddDescriptionButton'}
							>
								{meta || (isCreator ? t('components.treasury.descriptionPlaceholder') : '')}
							</SubHeading>
						</div>

						{senderActionObject && (
							<div className="grid grid-cols-10" data-testid={'TransactionRow__metaSenderWrapper'}>
								<SubHeading className="col-span-2" data-testid={'TransactionRow__metaSenderTitle'}>
									{t('components.treasury.from')}
								</SubHeading>
								<div className="col-span-8 flex items-center gap-1" data-testid={'TransactionRow__metaSender'}>
									{senderActionObject.type === 'member' ? (
										<UserAvatar
											size="xxs"
											fileId={senderActionObject.daoMember.user.avatar}
											seed={senderActionObject.walletAddress}
										/>
									) : (
										<UserAvatar size="xxs" seed={senderActionObject.walletAddress} />
									)}

									<SubHeading
										color={colors.foregroundSecondary}
										className="col-span-8"
										onClick={(event) => handleClickActionEntity(event, senderActionObject)}
										data-testid={`TransactionRow__metaSender${senderActionObject.displayName ? 'Name' : 'Wallet'}`}
									>
										{senderActionObject.displayName
											? senderActionObject.displayName
											: shrinkWallet(senderActionObject.walletAddress || '')}
									</SubHeading>

									{senderActionObject.walletAddress && (
										<IconButton
											className={getIconButtonClass()}
											onClick={(event) => handleOpenBlockExplorer(event, senderActionObject.walletAddress, false)}
											color="backgroundTertiary"
											icon={<ExternalLinkIcon fill={colors.foregroundTertiary} width={16} height={16} />}
											size="md"
											data-testid={`TransactionRow__metaSenderOpenButton`}
										/>
									)}
								</div>
							</div>
						)}

						{receiverActionObject && (
							<div className="grid grid-cols-10" data-testid={'TransactionRow__metaReceiverWrapper'}>
								<SubHeading className="col-span-2" data-testid={'TransactionRow__metaReceiverTitle'}>
									{t('components.treasury.to')}
								</SubHeading>
								<div className="col-span-8 flex items-center gap-1" data-testid={'TransactionRow__metaReceiver'}>
									{receiverActionObject.type === 'member' ? (
										<UserAvatar
											size="xxs"
											fileId={receiverActionObject.daoMember.user.avatar}
											seed={receiverActionObject.walletAddress}
										/>
									) : (
										<UserAvatar size="xxs" seed={receiverActionObject.walletAddress} />
									)}

									<SubHeading
										color={colors.foregroundSecondary}
										className="col-span-8"
										onClick={(event) => handleClickActionEntity(event, receiverActionObject)}
										data-testid={`TransactionRow__metaReceiver${senderActionObject.displayName ? 'Name' : 'Wallet'}`}
									>
										{receiverActionObject.displayName
											? receiverActionObject.displayName
											: shrinkWallet(receiverActionObject.walletAddress || '')}
									</SubHeading>

									{receiverActionObject.walletAddress && (
										<IconButton
											className={getIconButtonClass()}
											onClick={(event) => handleOpenBlockExplorer(event, receiverActionObject.walletAddress, false)}
											color="backgroundTertiary"
											icon={<ExternalLinkIcon fill={colors.foregroundTertiary} width={16} height={16} />}
											size="md"
											data-testid={`TransactionRow__metaReceiverOpenButton`}
										/>
									)}
								</div>
							</div>
						)}

						<div className={getSeparatorClass()} />

						<div className="grid grid-cols-11" data-testid={`TransactionRow__metaAdditionalInfo`}>
							{hash && (
								<SubHeading className="col-span-3" data-testid={`TransactionRow__metaHashWrapper`}>
									{t('components.treasury.transactionID')}
									<div className="flex items-center">
										<SubHeading color={colors.foregroundSecondary} data-testid={`TransactionRow__metaHash`}>
											{shrinkWallet(hash)}
										</SubHeading>
										<IconButton
											className={getIconButtonClass()}
											onClick={(event) => handleCopy(event, hash)}
											color={isMetaVisible ? 'backgroundTertiary' : 'backgroundSecondary'}
											icon={<CopyIcon fill={colors.foregroundTertiary} width={16} height={16} />}
											size="md"
											data-testid={`TransactionRow__metaHashCopyButton`}
										/>
										<IconButton
											className={cn(getIconButtonClass(), 'ml-[-5px]')}
											onClick={(event) => handleOpenBlockExplorer(event, hash, true)}
											color="backgroundTertiary"
											icon={<ExternalLinkIcon fill={colors.foregroundTertiary} width={16} height={16} />}
											size="md"
											data-testid={`TransactionRow__metaHashOpenButton`}
										/>
									</div>
								</SubHeading>
							)}
							<SubHeading className="col-span-3" data-testid={`TransactionRow__metaGasWrapper`}>
								{t('components.treasury.gasFee')}
								<div className="mt-1">
									<SubHeading
										color={colors.foregroundSecondary}
										data-testid={`TransactionRow__metaGasValue`}
									>{`${formatUnitsValue(gasFee, 18)} ${network?.currencySymbol || ''}`}</SubHeading>
								</div>
							</SubHeading>
							<SubHeading className="col-span-3" data-testid={`TransactionRow__metaExecutionTimeWrapper`}>
								{t('components.treasury.executed')}
								<div className="mt-1">
									<SubHeading color={colors.foregroundSecondary}>
										{`${executedDate}, ${executedTime.toLocaleString(DateTime.TIME_SIMPLE)}`}
									</SubHeading>
								</div>
							</SubHeading>
						</div>
					</Body>
				)}
			</Body>

			{isModalOpen && hash && isCreator && (
				<ChangeMetaModal
					isOpen={isModalOpen}
					onClose={closeModal}
					onSave={setMeta}
					initialValue={meta}
					title={t(`components.treasury.descriptionModal.${meta ? 'editDescription' : 'addDescription'}`)}
					{...{ ecosystem, chainId, walletId, hash }}
				/>
			)}
		</>
	);
};

const getRowClass = (isMetaVisible: boolean) => {
	const baseClass =
		'mb-2 grid grid-cols-12 rounded-lg py-2 pl-3 appearance-none bg-none cursor-pointer -ml-3 hover:bg-overlaySecondary';
	const metaVisibleClass = '!bg-overlaySecondary';

	return cn(baseClass, isMetaVisible && metaVisibleClass);
};

const getIconButtonClass = () => 'bg-transparent transition-none hover:backgroundTertiaryHover';

const getSeparatorClass = () => 'border-transparent border-solid border-t mt-4';
