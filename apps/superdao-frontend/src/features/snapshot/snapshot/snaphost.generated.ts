// @ts-nocheck
import { useQuery, UseQueryOptions, useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import * as Types from '../../../types/snapshot.generated';

import { requestSnapshotWrapper } from 'src/client/snapshotApi';

export type SnapshotSpaceQueryVariables = Types.Exact<{
	id: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type SnapshotSpaceQuery = {
	space: {
		id: string;
		name: string | null;
		about: string | null;
		network: string | null;
		symbol: string | null;
		members: Array<string | null> | null;
		avatar: string | null;
	} | null;
};

export type SnapshotProposalQueryVariables = Types.Exact<{
	id: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type SnapshotProposalQuery = {
	proposal: {
		id: string;
		title: string;
		body: string | null;
		choices: Array<string | null>;
		start: number;
		end: number;
		snapshot: string | null;
		state: string | null;
		author: string;
		votes: number | null;
		scores: Array<number | null> | null;
		space: { id: string; name: string | null } | null;
	} | null;
};

export type SnapshotProposalsQueryVariables = Types.Exact<{
	first?: Types.InputMaybe<Types.Scalars['Int']>;
	skip?: Types.InputMaybe<Types.Scalars['Int']>;
	where: Types.InputMaybe<Types.ProposalWhere>;
	orderBy?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type SnapshotProposalsQuery = {
	proposals: Array<{
		id: string;
		title: string;
		body: string | null;
		choices: Array<string | null>;
		start: number;
		end: number;
		snapshot: string | null;
		state: string | null;
		author: string;
		scores: Array<number | null> | null;
		space: { id: string; name: string | null } | null;
	} | null> | null;
};

export type SnapshotProposalVotesQueryVariables = Types.Exact<{
	first?: Types.InputMaybe<Types.Scalars['Int']>;
	skip?: Types.InputMaybe<Types.Scalars['Int']>;
	where: Types.InputMaybe<Types.VoteWhere>;
	orderBy?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type SnapshotProposalVotesQuery = {
	votes: Array<{
		id: string;
		voter: string;
		created: number;
		choice: any;
		proposal: { id: string } | null;
		space: { id: string };
	} | null> | null;
};

export const SnapshotSpaceDocument = `
    query snapshotSpace($id: String) {
  space(id: $id) {
    id
    name
    about
    network
    symbol
    members
    avatar
  }
}
    `;
export const useSnapshotSpaceQuery = <TData = SnapshotSpaceQuery, TError = unknown>(
	variables?: SnapshotSpaceQueryVariables,
	options?: UseQueryOptions<SnapshotSpaceQuery, TError, TData>
) =>
	useQuery<SnapshotSpaceQuery, TError, TData>(
		variables === undefined ? ['snapshotSpace'] : ['snapshotSpace', variables],
		requestSnapshotWrapper<SnapshotSpaceQuery, SnapshotSpaceQueryVariables>(SnapshotSpaceDocument, variables),
		options
	);

useSnapshotSpaceQuery.getKey = (variables?: SnapshotSpaceQueryVariables) =>
	variables === undefined ? ['snapshotSpace'] : ['snapshotSpace', variables];
export const useInfiniteSnapshotSpaceQuery = <TData = SnapshotSpaceQuery, TError = unknown>(
	variables?: SnapshotSpaceQueryVariables,
	options?: UseInfiniteQueryOptions<SnapshotSpaceQuery, TError, TData>
) => {
	return useInfiniteQuery<SnapshotSpaceQuery, TError, TData>(
		variables === undefined ? ['snapshotSpace.infinite'] : ['snapshotSpace.infinite', variables],
		(metaData) =>
			requestSnapshotWrapper<SnapshotSpaceQuery, SnapshotSpaceQueryVariables>(SnapshotSpaceDocument, {
				...variables,
				...(metaData.pageParam ?? {})
			})(),
		options
	);
};

useInfiniteSnapshotSpaceQuery.getKey = (variables?: SnapshotSpaceQueryVariables) =>
	variables === undefined ? ['snapshotSpace.infinite'] : ['snapshotSpace.infinite', variables];
useSnapshotSpaceQuery.fetcher = (variables?: SnapshotSpaceQueryVariables, options?: RequestInit['headers']) =>
	requestSnapshotWrapper<SnapshotSpaceQuery, SnapshotSpaceQueryVariables>(SnapshotSpaceDocument, variables, options);
export const SnapshotProposalDocument = `
    query snapshotProposal($id: String) {
  proposal(id: $id) {
    id
    title
    body
    choices
    start
    end
    snapshot
    state
    author
    space {
      id
      name
    }
    votes
    scores
  }
}
    `;
export const useSnapshotProposalQuery = <TData = SnapshotProposalQuery, TError = unknown>(
	variables?: SnapshotProposalQueryVariables,
	options?: UseQueryOptions<SnapshotProposalQuery, TError, TData>
) =>
	useQuery<SnapshotProposalQuery, TError, TData>(
		variables === undefined ? ['snapshotProposal'] : ['snapshotProposal', variables],
		requestSnapshotWrapper<SnapshotProposalQuery, SnapshotProposalQueryVariables>(SnapshotProposalDocument, variables),
		options
	);

useSnapshotProposalQuery.getKey = (variables?: SnapshotProposalQueryVariables) =>
	variables === undefined ? ['snapshotProposal'] : ['snapshotProposal', variables];
export const useInfiniteSnapshotProposalQuery = <TData = SnapshotProposalQuery, TError = unknown>(
	variables?: SnapshotProposalQueryVariables,
	options?: UseInfiniteQueryOptions<SnapshotProposalQuery, TError, TData>
) => {
	return useInfiniteQuery<SnapshotProposalQuery, TError, TData>(
		variables === undefined ? ['snapshotProposal.infinite'] : ['snapshotProposal.infinite', variables],
		(metaData) =>
			requestSnapshotWrapper<SnapshotProposalQuery, SnapshotProposalQueryVariables>(SnapshotProposalDocument, {
				...variables,
				...(metaData.pageParam ?? {})
			})(),
		options
	);
};

useInfiniteSnapshotProposalQuery.getKey = (variables?: SnapshotProposalQueryVariables) =>
	variables === undefined ? ['snapshotProposal.infinite'] : ['snapshotProposal.infinite', variables];
useSnapshotProposalQuery.fetcher = (variables?: SnapshotProposalQueryVariables, options?: RequestInit['headers']) =>
	requestSnapshotWrapper<SnapshotProposalQuery, SnapshotProposalQueryVariables>(
		SnapshotProposalDocument,
		variables,
		options
	);
export const SnapshotProposalsDocument = `
    query snapshotProposals($first: Int = 20, $skip: Int = 0, $where: ProposalWhere, $orderBy: String = "created") {
  proposals(first: $first, skip: $skip, where: $where, orderBy: $orderBy) {
    id
    title
    body
    choices
    start
    end
    snapshot
    state
    author
    space {
      id
      name
    }
    scores
  }
}
    `;
export const useSnapshotProposalsQuery = <TData = SnapshotProposalsQuery, TError = unknown>(
	variables?: SnapshotProposalsQueryVariables,
	options?: UseQueryOptions<SnapshotProposalsQuery, TError, TData>
) =>
	useQuery<SnapshotProposalsQuery, TError, TData>(
		variables === undefined ? ['snapshotProposals'] : ['snapshotProposals', variables],
		requestSnapshotWrapper<SnapshotProposalsQuery, SnapshotProposalsQueryVariables>(
			SnapshotProposalsDocument,
			variables
		),
		options
	);

useSnapshotProposalsQuery.getKey = (variables?: SnapshotProposalsQueryVariables) =>
	variables === undefined ? ['snapshotProposals'] : ['snapshotProposals', variables];
export const useInfiniteSnapshotProposalsQuery = <TData = SnapshotProposalsQuery, TError = unknown>(
	variables?: SnapshotProposalsQueryVariables,
	options?: UseInfiniteQueryOptions<SnapshotProposalsQuery, TError, TData>
) => {
	return useInfiniteQuery<SnapshotProposalsQuery, TError, TData>(
		variables === undefined ? ['snapshotProposals.infinite'] : ['snapshotProposals.infinite', variables],
		(metaData) =>
			requestSnapshotWrapper<SnapshotProposalsQuery, SnapshotProposalsQueryVariables>(SnapshotProposalsDocument, {
				...variables,
				...(metaData.pageParam ?? {})
			})(),
		options
	);
};

useInfiniteSnapshotProposalsQuery.getKey = (variables?: SnapshotProposalsQueryVariables) =>
	variables === undefined ? ['snapshotProposals.infinite'] : ['snapshotProposals.infinite', variables];
useSnapshotProposalsQuery.fetcher = (variables?: SnapshotProposalsQueryVariables, options?: RequestInit['headers']) =>
	requestSnapshotWrapper<SnapshotProposalsQuery, SnapshotProposalsQueryVariables>(
		SnapshotProposalsDocument,
		variables,
		options
	);
export const SnapshotProposalVotesDocument = `
    query snapshotProposalVotes($first: Int = 1, $skip: Int = 0, $where: VoteWhere, $orderBy: String = "created") {
  votes(first: $first, skip: $skip, where: $where, orderBy: $orderBy) {
    id
    voter
    created
    proposal {
      id
    }
    choice
    space {
      id
    }
  }
}
    `;
export const useSnapshotProposalVotesQuery = <TData = SnapshotProposalVotesQuery, TError = unknown>(
	variables?: SnapshotProposalVotesQueryVariables,
	options?: UseQueryOptions<SnapshotProposalVotesQuery, TError, TData>
) =>
	useQuery<SnapshotProposalVotesQuery, TError, TData>(
		variables === undefined ? ['snapshotProposalVotes'] : ['snapshotProposalVotes', variables],
		requestSnapshotWrapper<SnapshotProposalVotesQuery, SnapshotProposalVotesQueryVariables>(
			SnapshotProposalVotesDocument,
			variables
		),
		options
	);

useSnapshotProposalVotesQuery.getKey = (variables?: SnapshotProposalVotesQueryVariables) =>
	variables === undefined ? ['snapshotProposalVotes'] : ['snapshotProposalVotes', variables];
export const useInfiniteSnapshotProposalVotesQuery = <TData = SnapshotProposalVotesQuery, TError = unknown>(
	variables?: SnapshotProposalVotesQueryVariables,
	options?: UseInfiniteQueryOptions<SnapshotProposalVotesQuery, TError, TData>
) => {
	return useInfiniteQuery<SnapshotProposalVotesQuery, TError, TData>(
		variables === undefined ? ['snapshotProposalVotes.infinite'] : ['snapshotProposalVotes.infinite', variables],
		(metaData) =>
			requestSnapshotWrapper<SnapshotProposalVotesQuery, SnapshotProposalVotesQueryVariables>(
				SnapshotProposalVotesDocument,
				{ ...variables, ...(metaData.pageParam ?? {}) }
			)(),
		options
	);
};

useInfiniteSnapshotProposalVotesQuery.getKey = (variables?: SnapshotProposalVotesQueryVariables) =>
	variables === undefined ? ['snapshotProposalVotes.infinite'] : ['snapshotProposalVotes.infinite', variables];
useSnapshotProposalVotesQuery.fetcher = (
	variables?: SnapshotProposalVotesQueryVariables,
	options?: RequestInit['headers']
) =>
	requestSnapshotWrapper<SnapshotProposalVotesQuery, SnapshotProposalVotesQueryVariables>(
		SnapshotProposalVotesDocument,
		variables,
		options
	);
