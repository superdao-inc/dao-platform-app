import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { UseInfiniteQueryResult } from 'react-query';
import { useMemo } from 'react';
import uniq from 'lodash/uniqBy';

import { DaoMembersList } from './daoMembersList';

import { Label3 } from 'src/components';
import { DaoMembersQuery, useCheckCreatorExistsQuery } from 'src/gql/daoMembership.generated';
import { GetDaoWhitelistQuery } from 'src/gql/whitelist.generated';
import { colors } from 'src/style';
import { DaoMemberRole } from 'src/types/types.generated';

type Props = {
	filterValue: keyof typeof DaoMemberRole | 'Whitelist' | 'Email' | undefined;
	pages: DaoMembersQuery[] | undefined;
	whitelistPages: GetDaoWhitelistQuery[] | undefined;
	daoId: string;
	daoAddress: string;
	daoSlug: string;
	currentUserMemberRole?: DaoMemberRole;
	whitelistHook: Omit<UseInfiniteQueryResult, 'data' | 'isLoading'>;
	memberHook: Omit<UseInfiniteQueryResult, 'data' | 'isLoading'>;
};

export const DaoMembersContentArea = (props: Props) => {
	const {
		daoId,
		daoAddress,
		daoSlug,
		currentUserMemberRole,
		filterValue,
		pages,
		whitelistPages,
		whitelistHook,
		memberHook
	} = props;

	const { data: isCreatorExists } = useCheckCreatorExistsQuery({ daoId });

	const listMembers = useMemo(() => {
		if (!pages) {
			return [];
		}

		return uniq(pages.map((page) => page.daoMembers.items).flat(), 'userId');
	}, [pages]);

	const whitelistMembers = useMemo(() => {
		if (!whitelistPages) {
			return [];
		}

		return uniq(whitelistPages.map((page) => page.getDaoWhitelist?.items ?? []).flat(), 'id');
	}, [whitelistPages]);

	return ['Whitelist', 'Email'].includes(filterValue || '') ? (
		<>
			<TableHead filterValue={filterValue} />

			<DaoMembersList
				daoWhitelists={whitelistMembers}
				daoId={daoId}
				daoSlug={daoSlug}
				currentUserMemberRole={currentUserMemberRole!}
				queryHook={whitelistHook}
				daoAddress={daoAddress}
				typeList={filterValue === 'Whitelist' ? 'whitelist' : 'email'}
			/>
		</>
	) : (
		<>
			<TableHead filterValue={filterValue} />

			<DaoMembersList
				daoMembers={listMembers}
				daoId={daoId}
				daoSlug={daoSlug}
				currentUserMemberRole={currentUserMemberRole!}
				queryHook={memberHook}
				daoAddress={daoAddress}
				typeList="members"
				creatorExist={!!isCreatorExists?.checkCreatorExists}
			/>
		</>
	);
};

const TableHead = ({ filterValue }: Pick<Props, 'filterValue'>) => {
	const { t } = useTranslation();

	switch (filterValue) {
		case 'Whitelist':
			return (
				<div className="mb-1 hidden lg:flex lg:px-3">
					<ListHeaderItem>{t('pages.dao.members.columns.walletAddress')}</ListHeaderItem>
					<ListHeaderItem>{t('pages.dao.members.columns.availableTier')}</ListHeaderItem>
				</div>
			);
		case 'Email':
			return (
				<div className="mb-1 hidden lg:flex lg:px-3">
					<ListHeaderItem>{t('pages.dao.members.columns.email')}</ListHeaderItem>
					<ListHeaderItem className="pr-4">{t('pages.dao.members.columns.tier')}</ListHeaderItem>
					<ListHeaderItem className="pr-9">{t('pages.dao.members.columns.walletAddress')}</ListHeaderItem>
				</div>
			);
		default:
			return (
				<div className="mb-1 hidden lg:flex lg:px-3">
					<ListHeaderItem data-testid="DaoMembers__memberColumn">
						{t('pages.dao.members.columns.member')}
					</ListHeaderItem>
					<ListHeaderItem className="pr-4" data-testid="DaoMembers__roleColumn">
						{t('pages.dao.members.columns.role')}
					</ListHeaderItem>
					<ListHeaderItem className="pr-9" data-testid="DaoMembers__tierColumn">
						{t('pages.dao.members.columns.tier')}
					</ListHeaderItem>
				</div>
			);
	}
};

const ListHeaderItem = styled(Label3)`
	&:first-of-type {
		flex: 50%;
		flex-grow: 0;
	}

	flex: 1;

	color: ${colors.foregroundSecondary};
`;
