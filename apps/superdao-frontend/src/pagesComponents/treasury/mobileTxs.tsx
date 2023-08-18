import React, { Fragment } from 'react';
import { useTranslation } from 'next-i18next';

import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';
import { useDaoMembersQuery } from 'src/gql/daoMembership.generated';
import { colors } from 'src/style';
import { useDaoTransactionsQuery } from 'src/gql/treasury.generated';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { Body, Title3 } from 'src/components';
import { MobileTransactionRow } from './mobileTransactionRow';
import { useNetworksQuery } from 'src/gql/networks.generated';
import { Chain } from '@sd/superdao-shared';
import { MobileSkeletonTxs } from './mobileSkeletons/skeletonTxs';
import { AuthAPI } from 'src/features/auth/API';

type Props = {
	slug: string;
	daoId: string;
};

const MAX_ITEMS = 4;

export const MobileTxs: React.VFC<Props> = ({ slug, daoId }) => {
	const { t } = useTranslation();
	const networks = useNetworksQuery().data?.networks;

	const network = networks?.find((chain) => chain.chainId === Chain.Polygon);

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};
	const { data: daoMemberData } = useDaoMembersQuery({ daoId, roles: null });
	const { push, query } = useRouter();

	const { data: txData, isLoading } = useDaoTransactionsQuery(
		{ daoId, offset: 0, chainId: null },
		{
			keepPreviousData: true,
			cacheTime: 0
		}
	);

	if (!daoBySlug) return null;

	const txs = txData?.daoTransactions.items || [];

	if (isEmpty(txs) && !isLoading) return null;

	const handleGoToTxs = () => push(`/${query.slug}/treasury/transactions`);

	return (
		<>
			{isLoading ? (
				<MobileSkeletonTxs />
			) : (
				<div
					className="bg-backgroundSecondary mt-5 flex flex-col rounded-lg px-6 py-5"
					data-testid={'TransactionsList__wrapper'}
				>
					<div className="animate-[fadeIn_1s_ease-in]">
						<div className="flex justify-between pb-1.5">
							<Title3 className="capitalize" data-testid={'TransactionsList__title'}>
								{t('components.treasury.transactions', { count: txs.length })}
							</Title3>
							{txs?.length > MAX_ITEMS && isAuthorized && (
								<Body
									className="font-semibold"
									color={colors.accentPrimary}
									onClick={handleGoToTxs}
									data-testid={'TransactionsList__allTransactionsButton'}
								>
									{t('components.treasury.seeAll')}
								</Body>
							)}
						</div>
						{txs &&
							txs.slice(0, MAX_ITEMS).map((tx) => (
								<Fragment key={tx.hash}>
									<MobileTransactionRow
										tx={tx}
										{...{
											walletId: tx.walletId!,
											walletName: tx.walletName!,
											walletAddress: tx.walletAddress!,
											isCreator: true,
											daoMembers: daoMemberData?.daoMembers.items || [],
											network
										}}
									/>
								</Fragment>
							))}
					</div>
				</div>
			)}
		</>
	);
};
