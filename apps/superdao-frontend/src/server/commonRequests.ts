import { isString } from 'class-validator';
import { GetServerSidePropsContext } from 'next';
import { QueryClient } from 'react-query';

import { FEATURES } from '@sd/superdao-shared';

import { getUserByIdOrSlug } from 'src/client/commonRequests';
import { checkAuth } from 'src/client/ssr';
import { useDaoByAddressQuery } from 'src/gql/daos.generated';
import { useSingleNftQuery } from 'src/gql/nft.generated';
import { getProtocol } from 'src/utils/protocol';

import { getIsFeatureEnabled } from './featureToggles.service';

export const getUserNftSharingProps = async (
	queryClient: QueryClient,
	ctx: GetServerSidePropsContext,
	nftUserIdOrSLug: string
) => {
	try {
		const isSharingEnabled = getIsFeatureEnabled(FEATURES.SHARING_PREVIEW, ctx);
		const protocol = getProtocol(ctx);

		const { tokenId, daoAddress } = ctx.query;
		if (!isString(daoAddress) || !isString(tokenId)) return null;
		const { daoByAddress } = (await useDaoByAddressQuery.fetcher({ address: daoAddress })()) || {};
		queryClient.setQueryData(useDaoByAddressQuery.getKey({ address: daoAddress }), { daoByAddress });

		const { singleNft } = (await useSingleNftQuery.fetcher({ daoAddress, tokenId })()) || {};
		queryClient.setQueryData(useSingleNftQuery.getKey({ daoAddress, tokenId }), { singleNft });

		const { slug, name: daoName } = daoByAddress || {};
		const { tierName, tierId } = singleNft || {};
		if (!isString(tierName) || !isString(daoName)) return null;

		const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: nftUserIdOrSLug });
		if (!userByIdOrSlug) return null;

		const [, currentUser] = await checkAuth(ctx);
		const isCurrentUser = userByIdOrSlug.id === currentUser?.id;

		return {
			daoAddress,
			slug,
			daoName,
			tokenId,
			tierId,
			tierName,
			isSharingEnabled,
			protocol,
			isCurrentUser
		};
	} catch (error) {}
};
