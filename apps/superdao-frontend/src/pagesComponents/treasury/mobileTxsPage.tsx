import React, { Fragment } from 'react';

import { DateTime } from 'luxon';
import { useTranslation } from 'next-i18next';
import { MobileTransactionRow } from 'src/pagesComponents/treasury/mobileTransactionRow';
import { WalletTransaction } from 'src/types/types.generated';
import { PublicDaoMembershipFragment } from 'src/gql/daoMembership.generated';
import { Title2 } from 'src/components';
import { useNetworksQuery } from 'src/gql/networks.generated';
import { MobileTxsPageSkeleton } from './mobileSkeletons/mobileTxsPageSkeleton';

type Props = {
	transactions: WalletTransaction[];
	isCreator: boolean;
	daoMembers: PublicDaoMembershipFragment[];
	chainId: number | null;
	isPage?: boolean;
	isLoading?: boolean;
};

const formatDate = (date: DateTime) => date.setLocale('en-US').toFormat('MMMM dd');

export const MobileTxsPage: React.VFC<Props> = ({ transactions, isCreator, daoMembers, chainId, isLoading }) => {
	const { t } = useTranslation();
	const networks = useNetworksQuery().data?.networks;

	const network = networks?.find((chain) => chain.chainId === chainId);

	return isLoading ? (
		<MobileTxsPageSkeleton />
	) : (
		<div className="animate-[fadeIn_1s_ease-in]">
			{transactions &&
				transactions.map((tx, i) => {
					const executedDate = formatDate(DateTime.fromISO(tx.executed));
					const previousDate = formatDate(DateTime.fromISO(transactions[i - 1]?.executed));
					const today = formatDate(DateTime.now());
					const yesterday = formatDate(DateTime.now().minus({ days: 1 }));

					return (
						<Fragment key={i}>
							{executedDate !== previousDate ? (
								<div className="mr-4 flex items-center justify-between py-4" data-testid={'TransactionsList__wrapper'}>
									{executedDate === today || executedDate === yesterday ? (
										<>
											{executedDate === today && (
												<Title2 className="capitalize" data-testid={'TransactionsList__todayTitle'}>
													{t('components.treasury.today')}
												</Title2>
											)}
											{executedDate === yesterday && (
												<Title2 className="capitalize" data-testid={'TransactionsList__yesterdayTitle'}>
													{t('components.treasury.yesterday')}
												</Title2>
											)}
										</>
									) : (
										<Title2 data-testid={`TransactionsList__${executedDate}Title`}>{executedDate}</Title2>
									)}
								</div>
							) : null}
							<MobileTransactionRow
								tx={tx}
								{...{
									walletId: tx.walletId!,
									walletName: tx.walletName!,
									walletAddress: tx.walletAddress!,
									isCreator,
									daoMembers,
									network,
									isPage: true
								}}
							/>
						</Fragment>
					);
				})}
		</div>
	);
};
