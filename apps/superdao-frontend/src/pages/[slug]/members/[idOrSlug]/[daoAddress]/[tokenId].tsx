import { useRouter } from 'next/router';

import uniqBy from 'lodash/uniqBy';
import { SSR, prefetchData } from 'src/client/ssr';
import { getUserNftSharingProps } from 'src/server/commonRequests';
import { UserUI } from 'src/features/user';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { SharingAddon } from 'src/features/user/components/sharingAddon';
import { CollectionInfoByTierQuery, useCollectionInfoByTierQuery } from 'src/gql/nft.generated';
import { Owners, TierArtworkTypeStrings } from 'src/types/types.generated';

type Props = {
	daoAddress: string;
	slug: string;
	daoName: string;
	tierName: string;
	tokenId: string;
	tierId: string;
	isSharingEnabled: boolean;
	isCurrentUser: boolean;
	protocol: string;
	hostname: string;
	owners: Owners[];
	tierArtworkType?: TierArtworkTypeStrings;
};

const DaoMemberNftPage: NextPageWithLayout<Props> = (props) => {
	const { slug, daoName, tierName, tierId, protocol, hostname, isCurrentUser } = props;
	const { asPath } = useRouter();

	const fullUrl = protocol + hostname + asPath;

	return (
		<>
			<SharingAddon
				fullUrl={fullUrl}
				daoName={daoName}
				tier={tierName}
				tierId={tierId}
				hostname={hostname}
				protocol={protocol}
				isCurrentUser={isCurrentUser}
				slug={slug as string}
			/>
			<UserUI.UserNft isDaoTab fullUrl={fullUrl} {...props} />
		</>
	);
};

DaoMemberNftPage.getLayout = getDaoLayout;

export default DaoMemberNftPage;

export const getServerSideProps = SSR(async (ctx) => {
	const idOrSlug = ctx.params?.idOrSlug;
	if (typeof idOrSlug !== 'string') return { notFound: true };

	const [queryClient, getProps] = await prefetchData(ctx);

	const { daoAddress, slug, daoName, tokenId, tierId, tierName, isSharingEnabled, protocol, isCurrentUser } =
		(await getUserNftSharingProps(queryClient, ctx, idOrSlug)) || {};

	if (!daoAddress || !tierId) return { notFound: true };

	const tierQuery = await queryClient.fetchQuery<CollectionInfoByTierQuery | undefined>(
		useCollectionInfoByTierQuery.getKey({ daoAddress, tier: tierId }),
		useCollectionInfoByTierQuery.fetcher({ daoAddress, tier: tierId })
	);
	const tierData = tierQuery?.collectionInfoByTier;

	if (!tierData) return { notFound: true };

	const ownersHashMap = uniqBy(tierData.owners, 'id');

	return {
		props: {
			daoAddress,
			slug,
			daoName,
			tokenId,
			tierId,
			tierName,
			isSharingEnabled,
			protocol,
			isCurrentUser,
			owners: ownersHashMap,
			tierArtworkType: tierData.tierArtworkType,
			...getProps()
		}
	};
});
