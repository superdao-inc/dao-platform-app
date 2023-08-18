import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';

import styled from '@emotion/styled';
import { CSVDownload } from 'react-csv';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { featureToggles } from 'src/server/featureToggles.service';
import { colors } from 'src/style';

import { generateInfinitePage, prefetchData, SSR } from 'src/client/ssr';

import {
	daoMembersOffsetGenerator,
	daoWhitelistEmailsOffsetGenerator,
	daoWhitelistOffsetGenerator,
	EInterlayerAction,
	EInterlayerType,
	useDebounce,
	useInterlayerUploadModal
} from 'src/hooks';

import {
	Button,
	DownloadIcon,
	IconButton,
	PageContent,
	PageLoader,
	PlusIcon,
	SubHeading,
	Title1
} from 'src/components';
import { DaoMembersSearch } from 'src/pagesComponents/dao/daoMembersSearch';
import { DaoMembersImport } from 'src/pagesComponents/membersImport/members/daoMembersImport';

import { DaoMemberRole, DaoMode, WhitelistTargetsEnum } from 'src/types/types.generated';

import {
	defaultMembersVariables,
	getCurrentUserAsMember,
	getDaoWithRoles,
	getMembers,
	getWhitelistParticipantsPages
} from 'src/client/commonRequests';
import {
	DaoMembersQuery,
	useDaoMembersToExportQuery,
	useInfiniteDaoMembersQuery
} from 'src/gql/daoMembership.generated';

import { GetDaoWhitelistQuery, useInfiniteGetDaoWhitelistQuery } from 'src/gql/whitelist.generated';

import { DaoMembersContentArea } from 'src/pagesComponents/dao/daoMembersContentArea';
import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user/API';
import { CustomHead } from 'src/components/head';
import { paginatedResponsePlaceholder } from '@sd/superdao-shared';
import Tooltip from 'src/components/tooltip';
import { AddMembersBtn } from 'src/pagesComponents/dao/addMembersBtn';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';
import { MobileHeader } from 'src/components/mobileHeader';
import { useCollectionTiersById } from 'src/hooks/useCollectionTiers';
import { getTiersNames } from 'src/utils/tiers';
import { UploadInterlayerModal } from 'src/pagesComponents/membersImport/uploadInterlayerModal';
import { UploadModal } from 'src/pagesComponents/membersImport/uploadModal';

type Props = {
	slug: string;
	daoId: string;
	daoAddress: string;
	isDuplicatesActive: boolean;
};

type FilterType = keyof typeof DaoMemberRole | 'Whitelist' | 'Email';

const DaoMembers: NextPageWithLayout<Props> = ({ slug, daoId, daoAddress, isDuplicatesActive }) => {
	const { t } = useTranslation();

	const [filterValue, setFilterValue] = useState<FilterType>();
	const [searchValue, setSearchValue] = useState('');
	const debouncedSearch = useDebounce(searchValue, 400);

	const [exportData, setExportData] = useState<string[][] | null>(null);

	const { push, query, back } = useRouter();

	const isAuthorized = AuthAPI.useIsAuthorized();
	const { data: daoData } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: dao } = daoData || {};

	const {
		data: daoMembersData,
		isLoading,
		...memberHook
	} = useInfiniteDaoMembersQuery(
		{
			...defaultMembersVariables,
			daoId,
			search: debouncedSearch,
			roles:
				filterValue && !['Whitelist', 'Email'].includes(filterValue)
					? [DaoMemberRole[filterValue! as DaoMemberRole]] //as потому что Whitelist и Email фильтры не из DaoMemberRole, но значения фильтров такие есть, но по условия быть они не могут
					: null
		},
		{
			enabled: isAuthorized,
			keepPreviousData: true,
			getNextPageParam: daoMembersOffsetGenerator
		}
	);
	const { pages } = daoMembersData || {};

	const {
		data: daoWhitelistData,
		isLoading: isWhitelistLoading,
		...whitelistHook
	} = useInfiniteGetDaoWhitelistQuery(
		{
			...defaultMembersVariables,
			daoId,
			target: WhitelistTargetsEnum.Sale,
			search: debouncedSearch
		},
		{
			enabled: isAuthorized,
			keepPreviousData: true,
			getNextPageParam: daoWhitelistOffsetGenerator
		}
	);

	const {
		data: daoWhitelistEmailsData,
		isLoading: isWhitelistEmalsLoading,
		...whitelistEmailsHook
	} = useInfiniteGetDaoWhitelistQuery(
		{
			...defaultMembersVariables,
			daoId,
			target: WhitelistTargetsEnum.EmailClaim,
			search: debouncedSearch
		},
		{
			enabled: isAuthorized,
			keepPreviousData: true,
			getNextPageParam: daoWhitelistEmailsOffsetGenerator
		}
	);
	const { pages: whitelistPages } = daoWhitelistData || {};
	const { pages: whitelistEmailsPages } = daoWhitelistEmailsData || {};
	const whitelistParticipantsCount = whitelistPages ? whitelistPages[0].getDaoWhitelist.count : 0;
	const whitelistEmailsParticipantsCount = whitelistEmailsPages ? whitelistEmailsPages[0].getDaoWhitelist.count : 0;

	useEffect(() => {
		if (!['Whitelist', 'Email'].includes(filterValue || '')) {
			memberHook.refetch();
		} else {
			whitelistEmailsHook.refetch();
			whitelistHook.refetch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterValue, dao]);

	const { data: memberRoleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });

	const { currentUserMemberRole } = memberRoleData || {};
	const isCreator = isAdmin(currentUserMemberRole);

	useEffect(() => {
		if (dao?.mode === DaoMode.Achievements && !isCreator) {
			push(`/${slug}/achievements`);
		}
	}, [isCreator, slug, push, dao?.mode]);

	const { membersCount, memberRoles } = dao || {};

	const { ADMIN, MEMBER } = memberRoles || {};
	const filters = useMemo(
		() =>
			[
				{
					label: t('pages.dao.members.filter.all'),
					count: membersCount ?? 0,
					onClick: () => setFilterValue(undefined),
					activeValue: undefined
				},
				{
					label: t('pages.dao.members.filter.admin'),
					count: ADMIN,
					onClick: () => setFilterValue(DaoMemberRole.Admin),
					activeValue: DaoMemberRole.Admin
				},
				{
					label: t('pages.dao.members.filter.member'),
					count: MEMBER,
					onClick: () => setFilterValue(DaoMemberRole.Member),
					activeValue: DaoMemberRole.Member
				}
			].filter(({ count }) => !!count),
		[ADMIN, MEMBER, membersCount, t]
	);

	useEffect(() => {
		if (exportData) {
			setExportData(null);
		}
	}, [exportData]);

	const tiers = useCollectionTiersById(daoAddress);

	const handleMembersExport = async () => {
		const { exportMembers } = (await useDaoMembersToExportQuery.fetcher({ daoId })()) || {};
		const exportDataFromRequest = [['walletAddress', 'tier', 'email']];
		exportMembers?.items.forEach((item) =>
			exportDataFromRequest.push([
				item.user.walletAddress,
				getTiersNames(tiers, item.tiers).join(','),
				item.user.email ?? ''
			])
		);
		console.log(exportDataFromRequest);
		setExportData(exportDataFromRequest);
	};

	const { isAirdrop: shouldAirdropImportPageBeOpen, isWhitelist: shouldWhitelistImportPageBeOpen } = query;

	const isImportPage = shouldAirdropImportPageBeOpen || shouldWhitelistImportPageBeOpen;

	const headAdditionalTitle = isImportPage ? 'Members addition' : 'Members';

	const {
		isUploadModalOpen,
		isUploadWhitelistModalOpen,
		isUploadInterlayerModalOpen,
		isUploadWhitelistInterlayerModalOpen,
		handleSubmitUploadModal,
		handleSubmitWhitelistUploadModal,
		withHandleInterlayerSelect,
		toggleWhitelistInterlayerUploadModal,
		toggleInterlayerUploadModal,
		closeUploadModal,
		closeWhitelistUploadModal,
		csvFilename,
		csvParticipants
	} = useInterlayerUploadModal({ slug });

	if (isLoading || isWhitelistLoading || isWhitelistEmalsLoading) {
		return (
			<PageContent className="items-center">
				<CustomHead
					main={daoData?.daoBySlug?.name ?? 'Members'}
					additional={daoData?.daoBySlug?.name ?? 'Superdao'}
					description={daoData?.daoBySlug?.description ?? ''}
					avatar={daoData?.daoBySlug?.avatar ?? null}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	if (!pages || !daoData) return null;

	const AddMemberButton = isCreator ? (
		<AddMembersBtn
			className="p-2 lg:min-h-[40px] lg:min-w-[40px] lg:px-4"
			size="md"
			color="accentPrimary"
			label={
				<>
					<div className="hidden lg:block">{t('pages.dao.members.actions.addMembers')}</div>
					<PlusIcon className="lg:hidden" fill="white" />
				</>
			}
			slug={slug}
			daoId={daoId}
			toggleInterlayerUploadModal={toggleInterlayerUploadModal}
			toggleWhitelistInterlayerUploadModal={toggleWhitelistInterlayerUploadModal}
		/>
	) : null;

	return (
		<PageContent
			onBack={isImportPage ? back : undefined}
			columnSize={isImportPage ? 'sm' : 'md'}
			className="-mb-5 h-screen lg:-mb-[60px] lg:pb-5"
			columnClassName="flex flex-col"
		>
			<CustomHead
				main={daoData?.daoBySlug?.name ?? ''}
				additional={headAdditionalTitle}
				description={daoData?.daoBySlug?.description ?? ''}
				avatar={daoData?.daoBySlug?.avatar}
			/>

			{!isImportPage && <Title1 className="mb-6 hidden lg:block">{t('pages.members.title')}</Title1>}

			<MobileHeader withBurger title={!isImportPage ? t('pages.members.title') : ''} right={AddMemberButton} />

			{exportData && <CSVDownload data={exportData} enclosingCharacter="" separator=";" />}

			{isImportPage ? (
				<DaoMembersImport
					csvFilename={csvFilename}
					csvParticipants={csvParticipants}
					slug={slug}
					daoId={daoId}
					daoAddress={daoAddress}
					isWhitelistMode={Boolean(shouldWhitelistImportPageBeOpen)}
					isDuplicatesActive={isDuplicatesActive}
				/>
			) : (
				<>
					<div
						className={cn('bg-backgroundPrimary z-5 sticky top-[56px] flex justify-between pb-4 lg:static lg:bg-none', {
							'gap-4': isCreator
						})}
					>
						<DaoMembersSearch value={searchValue} onChange={setSearchValue} />

						{isCreator && (
							<div className="hidden gap-4 lg:flex">
								<Tooltip
									content={<SubHeading>{t('pages.dao.members.actions.exportMembers')}</SubHeading>}
									placement="bottom"
								>
									<IconButton
										size="lg"
										isSymmetric
										icon={<DownloadIcon />}
										onClick={handleMembersExport}
										color="overlaySecondary"
									/>
								</Tooltip>

								{AddMemberButton}
							</div>
						)}
					</div>

					<main className="lg:bg-backgroundSecondary flex flex-col overflow-hidden bg-transparent lg:rounded-lg lg:px-3 lg:py-5">
						<div className="scrollbar-hide -ml-4 -mr-4 mb-3 flex shrink-0 flex-nowrap items-center gap-3 overflow-auto px-4 lg:-ml-3 lg:-mr-3 lg:mb-5 lg:px-6">
							{filters.map((item) => (
								<FilterItem key={item.label} filterValue={filterValue} {...item} />
							))}
							{whitelistParticipantsCount > 0 && (
								<div className="ml-1 flex items-center">
									<div className="bg-foregroundQuaternary h-6 w-[1px]" />

									<Button
										className="ml-4 whitespace-nowrap rounded-full"
										color={filterValue === 'Whitelist' ? 'accentPrimary' : 'overlayTertiary'}
										size="md"
										onClick={() => setFilterValue('Whitelist')}
										label={
											<>
												{t('pages.dao.members.filter.whitelist')}{' '}
												<Counter isActive={filterValue === 'Whitelist'}>{whitelistParticipantsCount}</Counter>
											</>
										}
										data-testid="DaoMembers__whitelistFilter"
									/>
								</div>
							)}

							{isCreator && whitelistEmailsParticipantsCount > 0 && (
								<div className="ml-1 flex items-center">
									<div className="bg-foregroundQuaternary h-6 w-[1px]" />

									<Button
										className="ml-4 whitespace-nowrap rounded-full"
										color={filterValue === 'Email' ? 'accentPrimary' : 'overlayTertiary'}
										size="md"
										onClick={() => setFilterValue('Email')}
										label={
											<>
												{t('pages.dao.members.filter.email')}{' '}
												<Counter isActive={filterValue === 'Email'}>{whitelistEmailsParticipantsCount}</Counter>
											</>
										}
										data-testid="DaoMembers__whitelistFilter"
									/>
								</div>
							)}
						</div>

						<DaoMembersContentArea
							daoId={daoId}
							daoAddress={daoAddress}
							daoSlug={slug}
							currentUserMemberRole={currentUserMemberRole}
							filterValue={filterValue}
							pages={pages}
							whitelistPages={filterValue === 'Whitelist' ? whitelistPages : whitelistEmailsPages}
							whitelistHook={filterValue === 'Whitelist' ? whitelistHook : whitelistEmailsHook}
							memberHook={memberHook}
						/>
					</main>

					<UploadInterlayerModal
						isOpen={isUploadWhitelistInterlayerModalOpen}
						onManualSelected={withHandleInterlayerSelect(EInterlayerAction.MANUAL, EInterlayerType.WHITELIST)}
						onImportSelected={withHandleInterlayerSelect(EInterlayerAction.IMPORT, EInterlayerType.WHITELIST)}
						onCancel={toggleWhitelistInterlayerUploadModal}
						title={t('pages.importMembers.modal.interlayer.whitelistHeading')}
						description={t('pages.importMembers.modal.interlayer.whitelistDescription')}
					/>

					<UploadInterlayerModal
						isOpen={isUploadInterlayerModalOpen}
						onManualSelected={withHandleInterlayerSelect(EInterlayerAction.MANUAL, EInterlayerType.AIRDROP)}
						onImportSelected={withHandleInterlayerSelect(EInterlayerAction.IMPORT, EInterlayerType.AIRDROP)}
						onCancel={toggleInterlayerUploadModal}
					/>

					<UploadModal
						isOpen={isUploadWhitelistModalOpen}
						onSubmit={handleSubmitWhitelistUploadModal}
						onCancel={closeWhitelistUploadModal}
					/>

					<UploadModal isOpen={isUploadModalOpen} onSubmit={handleSubmitUploadModal} onCancel={closeUploadModal} />
				</>
			)}
		</PageContent>
	);
};

DaoMembers.getLayout = getDaoLayout;

type FilterItemProps = {
	label: string;
	count: number | null | undefined;
	activeValue?: DaoMemberRole;
	filterValue?: FilterType;
	onClick: () => void;
};

const FilterItem = ({ label, count, activeValue, filterValue, onClick }: FilterItemProps) => {
	const isActive = activeValue === filterValue;
	const btnLabel = (
		<>
			{label} <Counter isActive={isActive}>{count}</Counter>
		</>
	);

	return (
		<Button
			className="whitespace-nowrap rounded-full"
			key={label}
			color={isActive ? 'accentPrimary' : 'overlayTertiary'}
			size="md"
			onClick={onClick}
			label={btnLabel}
			data-testid={`DaoMembers__${label.toLowerCase()}Filter`}
		/>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const userId = ctx.req.session?.userId;
	const slug = ctx.params?.slug;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	if (isAuthorized) {
		const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });

		if (userAsMember) {
			await getMembers(queryClient, ctx, { daoId: dao.id, ...defaultMembersVariables });
			await getWhitelistParticipantsPages(queryClient, ctx, { daoId: dao.id, ...defaultMembersVariables });
		}
	} else {
		queryClient.setQueryData(UserAPI.useCurrentUserMemberRoleQuery.getKey({ daoId: dao.id }), null);

		const paginatedData = generateInfinitePage<DaoMembersQuery>('daoMembers', paginatedResponsePlaceholder());
		queryClient.setQueryData(
			useInfiniteDaoMembersQuery.getKey({ daoId: dao.id, ...defaultMembersVariables }),
			paginatedData
		);

		const paginatedWhitelistData = generateInfinitePage<GetDaoWhitelistQuery>(
			'getDaoWhitelist',
			paginatedResponsePlaceholder()
		);
		queryClient.setQueryData(
			useInfiniteGetDaoWhitelistQuery.getKey({
				daoId: dao.id,
				target: WhitelistTargetsEnum.Sale,
				...defaultMembersVariables
			}),
			paginatedWhitelistData
		);
	}

	const isDuplicatesActive = featureToggles.isEnabled('is_duplicates_active');

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			daoAddress: dao.contractAddress,
			isDuplicatesActive,
			...getProps()
		}
	};
});

export default DaoMembers;

const Counter = styled.span<{ isActive: boolean }>`
	color: ${(props) => (props.isActive ? '#fff' : colors.foregroundSecondary)};
`;
