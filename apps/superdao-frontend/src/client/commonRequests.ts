import { QueryClient } from 'react-query';
import { GetServerSidePropsContext } from 'next';
import { generateInfinitePage } from './queryUtils';
import {
	DaoBySlugWithRolesQueryVariables,
	DaoPreviewByIdQueryVariables,
	DaoVerificationStatusQueryVariables,
	PublicDaoFragment,
	useDaoBySlugQuery,
	useDaoBySlugWithRolesQuery,
	useDaoPreviewByIdQuery,
	useDaoVerificationStatusQuery
} from 'src/gql/daos.generated';
import {
	DaoMembersQuery,
	DaoMembersQueryVariables,
	useDaoMembersQuery,
	useInfiniteDaoMembersQuery,
	UserAsMemberQueryVariables
} from 'src/gql/daoMembership.generated';

import {
	GetDaoWhitelistQuery,
	useGetDaoWhitelistQuery,
	useInfiniteGetDaoWhitelistQuery
} from 'src/gql/whitelist.generated';

import { UserByIdOrSlugQueryVariables, UserDaoParticipationQueryVariables } from 'src/gql/user.generated';
import { UserAPI } from 'src/features/user';
import { DEFAULT_MEMBERS_LIMIT } from 'src/hooks';
import { useWalletQuery, WalletQueryVariables } from 'src/gql/wallet.generated';
import { WhitelistTargetsEnum } from 'src/types/types.generated';
import { GetProposalQueryVariables, useGetProposalQuery } from 'src/gql/proposal.generated';

const getCookieHeaders = (ctx: GetServerSidePropsContext): { cookie: string } => ({
	cookie: ctx.req.headers.cookie || ''
});

export const getDaoWithRoles = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: DaoBySlugWithRolesQueryVariables,
	isAuthorized: boolean
) => {
	const headers = getCookieHeaders(ctx);

	let daoBySlug: PublicDaoFragment | undefined | null;
	if (isAuthorized) {
		const { daoBySlug: dao } = (await useDaoBySlugWithRolesQuery.fetcher(variables, headers)()) || {};
		daoBySlug = dao;
	} else {
		const { daoBySlug: dao } = (await useDaoBySlugQuery.fetcher(variables, headers)()) || {};
		daoBySlug = dao;
	}

	if (!daoBySlug) return null;
	queryClient.setQueryData(useDaoBySlugQuery.getKey(variables), { daoBySlug });
	queryClient.setQueryData(useDaoBySlugWithRolesQuery.getKey(variables), { daoBySlug });

	return daoBySlug;
};

export const getDaoPreviewById = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: DaoPreviewByIdQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { daoById } = (await useDaoPreviewByIdQuery.fetcher(variables, headers)()) || {};

	if (!daoById) return null;
	queryClient.setQueryData(useDaoPreviewByIdQuery.getKey(variables), { daoById });

	return daoById;
};

export const getDaoVerificationStatus = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: DaoVerificationStatusQueryVariables
) => {
	const headers = getCookieHeaders(ctx);

	const { daoVerificationStatus } = (await useDaoVerificationStatusQuery.fetcher(variables, headers)()) || {
		daoVerificationStatus: false
	};

	queryClient.setQueryData(useDaoVerificationStatusQuery.getKey(variables), { daoVerificationStatus });

	return daoVerificationStatus;
};

export const getUserByIdOrSlug = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: UserByIdOrSlugQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { userByIdOrSlug } = (await UserAPI.useUserByIdOrSlugQuery.fetcher(variables, headers)()) || {};

	if (!userByIdOrSlug) return null;
	queryClient.setQueryData(UserAPI.useUserByIdOrSlugQuery.getKey(variables), { userByIdOrSlug });

	return userByIdOrSlug;
};

export const getUserDaoParticipation = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: UserDaoParticipationQueryVariables
) => {
	const headers = getCookieHeaders(ctx);

	const { daoParticipation } = (await UserAPI.useUserDaoParticipationQuery.fetcher(variables, headers)()) || {};
	queryClient.setQueryData(UserAPI.useUserDaoParticipationQuery.getKey(variables), { daoParticipation });

	return daoParticipation;
};

export const getCurrentUserAsMember = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: UserAsMemberQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { userAsMember } = (await UserAPI.useUserAsMemberQuery.fetcher(variables, headers)()) || {};

	if (!userAsMember) return null;
	queryClient.setQueryData(UserAPI.useUserAsMemberQuery.getKey(variables), { userAsMember });
	queryClient.setQueryData(UserAPI.useCurrentUserMemberRoleQuery.getKey({ daoId: variables.daoId }), {
		currentUserMemberRole: userAsMember.role
	});

	return userAsMember;
};

export const defaultMembersVariables: Omit<DaoMembersQueryVariables, 'daoId'> = {
	roles: null,
	offset: 0,
	limit: DEFAULT_MEMBERS_LIMIT,
	search: ''
};

export const getMembers = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: DaoMembersQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { daoMembers } = (await useDaoMembersQuery.fetcher(variables, headers)()) || {};

	if (!daoMembers) return null;
	const paginatedResult = generateInfinitePage<DaoMembersQuery>('daoMembers', daoMembers);
	queryClient.setQueryData(useInfiniteDaoMembersQuery.getKey({ ...variables }), paginatedResult);

	return daoMembers;
};

// get all po pages
export const getWhitelistParticipantsPages = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: DaoMembersQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { getDaoWhitelist } =
		(await useGetDaoWhitelistQuery.fetcher({ ...variables, target: WhitelistTargetsEnum.Sale }, headers)()) || {};

	if (!getDaoWhitelist) return null;
	const paginatedResult = generateInfinitePage<GetDaoWhitelistQuery>('getDaoWhitelist', getDaoWhitelist);
	queryClient.setQueryData(
		useInfiniteGetDaoWhitelistQuery.getKey({ ...variables, target: WhitelistTargetsEnum.Sale }),
		paginatedResult
	);

	return getDaoWhitelist;
};

export const getWallet = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: WalletQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { wallet } = (await useWalletQuery.fetcher(variables, headers)()) || {};
	if (!wallet) return null;
	queryClient.setQueryData(useWalletQuery.getKey({ ...variables }), { wallet });

	return wallet;
};

export const getProposal = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	variables: GetProposalQueryVariables
) => {
	const headers = getCookieHeaders(ctx);
	const { getProposal } = (await useGetProposalQuery.fetcher(variables, headers)()) || {};
	if (!getProposal) return null;
	queryClient.setQueryData(useGetProposalQuery.getKey({ ...variables }), { getProposal });

	return getProposal;
};
