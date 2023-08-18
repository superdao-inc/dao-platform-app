import { useTranslation } from 'next-i18next';
import React from 'react';
import find from 'lodash/find';

import { getOptimizedFileUrl } from 'src/utils/upload';
import { getAddress } from '@sd/superdao-shared';
import { Body, Caption, ContractIcon, Ellipsis, Label2, UserAvatar } from 'src/components';
import { shrinkWallet } from '@sd/superdao-shared';
import { getWalletTransactionTypeTranslationKey } from 'src/utils/walletTransaction';
import { WalletTransactionDirection, WalletTransactionType, WalletTransaction } from 'src/types/types.generated';
import { PublicDaoMembershipFragment } from 'src/gql/daoMembership.generated';
import { colors } from 'src/style';

import { DirectionTransferParts } from './directionTransferParts';

type Props = {
	walletName: string;
	walletAddress: string;
	daoMembers: PublicDaoMembershipFragment[];
	tx: WalletTransaction;
	isPage?: boolean;
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

export const MobileTransactionRow: React.FC<Props> = ({ walletName, walletAddress, tx, daoMembers, isPage }) => {
	const { parts, type, direction } = tx;

	const { t } = useTranslation();

	const getActionObject = (
		address: string | null | undefined,
		daoMembers: PublicDaoMembershipFragment[]
	): TransactionActionObject => {
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

	const senderActionObject = getActionObject(parts && parts[0] ? parts[0].from.address : tx.fromAddress, daoMembers);
	const receiverActionObject = getActionObject(parts && parts[0] ? parts[0]?.to.address : tx.toAddress, daoMembers);

	const actionObjectByType = {
		[WalletTransactionType.Execution]: getActionObject(tx.fromAddress, daoMembers),
		[WalletTransactionType.Sell]: getActionObject(tx.fromAddress, daoMembers),
		[WalletTransactionType.Receive]: senderActionObject,
		[WalletTransactionType.ReceiveNft]: senderActionObject,
		[WalletTransactionType.SendNft]: receiverActionObject,
		[WalletTransactionType.Send]: receiverActionObject,
		[WalletTransactionType.SafeSetup]: getActionObject(tx.fromAddress, daoMembers)
	};

	const actionObject = actionObjectByType[type];

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
			<div className={`mb-2 flex justify-between rounded-lg py-1.5`} data-testid={'TransactionRow__wrapper'}>
				<div className="flex items-center">
					{isPage ? (
						actionObject && type !== WalletTransactionType.Execution ? (
							<UserAvatar
								size="sm"
								src={
									actionObject.type === 'member' && actionObject.daoMember.user.avatar
										? getOptimizedFileUrl(actionObject.daoMember.user.avatar)
										: undefined
								}
								seed={actionObject.walletAddress}
								className="mr-2.5"
							/>
						) : (
							<div
								className="bg-overlayTertiary mr-2.5 flex h-8 w-8 items-center justify-center rounded-full"
								data-testid={'TransactionRow__contractIcon'}
							>
								<ContractIcon height={16} />
							</div>
						)
					) : null}
					<div>
						<Ellipsis
							className="text-left capitalize"
							as={Label2}
							data-testid={`TransactionRow__${getActionObjectTitle(actionObject)}`}
						>
							{getActionObjectTitle(actionObject)}
						</Ellipsis>
						<Caption
							color={colors.foregroundSecondary}
							className="capitalize"
							data-testid={'TransactionRow__transactionType'}
						>
							{t(getWalletTransactionTypeTranslationKey(type))}
						</Caption>
					</div>
				</div>

				<Body className="ml-auto" data-testid={'TransactionRow__transferWrapper'}>
					{outgoing && outgoing?.length > 0 && <DirectionTransferParts parts={outgoing} />}

					{incoming && incoming?.length > 0 && <DirectionTransferParts parts={incoming} />}
				</Body>
			</div>
		</>
	);
};
