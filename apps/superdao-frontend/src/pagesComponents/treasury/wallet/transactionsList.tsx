import React, { Fragment } from 'react';
import { useTranslation } from 'next-i18next';

import cn from 'classnames';
import { TransactionRow } from './transactionRow';
import { flexWrapper } from '../styles';
import { WalletTransaction } from 'src/types/types.generated';
import { PublicDaoMembershipFragment } from 'src/gql/daoMembership.generated';
import { Title3 } from 'src/components';
import { colors } from 'src/style';
import { useNetworksQuery } from 'src/gql/networks.generated';
import { SkeletonTxs, SkeletonTxsBlock } from './skeletonTxs';
import { WalletsNameQuery } from 'src/gql/wallet.generated';

type Props = {
	transactions: WalletTransaction[];
	isCreator: boolean;
	daoMembers: PublicDaoMembershipFragment[];
	chainId: number | null;
	isPage?: boolean;
	isLoading?: boolean;
	walletsName: WalletsNameQuery['walletsName'];
};

export const TransactionsList: React.VFC<Props> = ({
	transactions,
	isCreator,
	daoMembers,
	chainId,
	isPage,
	isLoading,
	walletsName
}) => {
	const { t } = useTranslation();
	const networks = useNetworksQuery().data?.networks;

	const network = networks?.find((chain) => chain.chainId === chainId);

	return isLoading ? (
		<>{isPage ? <SkeletonTxs /> : <SkeletonTxsBlock />}</>
	) : (
		<div
			className="bg-backgroundSecondary flex flex-col rounded-lg pr-3 pl-6"
			data-testid={'TransactionsList__wrapper'}
		>
			<div className="animate-[fadeIn_1s_ease-in]">
				<div className={cn(flexWrapper, 'flex-col gap-0')}>
					{!isPage && (
						<div className="flex gap-2 py-5">
							<Title3 data-testid={'TransactionsList__title'}>{t('components.treasury.transactions')}</Title3>
							<Title3 color={colors.foregroundTertiary} data-testid={'TransactionsList__count'}>
								{transactions.length}
							</Title3>
						</div>
					)}
				</div>
				{transactions &&
					transactions.map((tx) => (
						<Fragment key={tx.hash}>
							<TransactionRow
								tx={tx}
								{...{
									walletId: tx.walletId!,
									walletName: tx.walletName!,
									walletAddress: tx.walletAddress!,
									isCreator,
									daoMembers,
									network,
									walletsName
								}}
							/>
						</Fragment>
					))}
			</div>
		</div>
	);
};
