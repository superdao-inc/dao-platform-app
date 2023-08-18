import { useRouter } from 'next/router';

import { FEATURES, isString } from '@sd/superdao-shared';

import { getDaoWithRoles } from 'src/client/commonRequests';
import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { SharingAddon } from 'src/features/checkout/success/components/sharingAddon';
import { ClaimNftSuccessContainer } from 'src/features/claim/success/container/claimNftSuccess';
import { getIsFeatureEnabled } from 'src/server/featureToggles.service';
import { getProtocol } from 'src/utils/protocol';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { useCollectionArtworksQuery, useGetMintedNftMetaQuery } from 'src/gql/nft.generated';
import { NftMetadata } from 'src/types/types.generated';

type Props = {
	isSharingEnabled: boolean;
	hostname: string;
	protocol: string;
	daoName: string;
	daoAddress: string;
	daoDescription: string;
	userId?: string;
	tokenId?: number;
	artworkId?: number;
	artwork?: NftMetadata;
};

const Success: NextPageWithLayout<Props> = ({
	hostname,
	protocol,
	daoName,
	daoDescription,
	isSharingEnabled,
	artworkId,
	artwork,
	daoAddress,
	tokenId,
	userId
}) => {
	const { asPath, query } = useRouter();
	let { slug, tier } = query;
	tier = tier as string;

	const fullUrl = protocol + hostname + asPath;

	return (
		<>
			{isSharingEnabled && (
				<SharingAddon
					fullUrl={fullUrl}
					daoName={daoName}
					tier={tier}
					hostname={hostname}
					protocol={protocol}
					slug={slug as string}
					artworkId={artworkId}
					daoDescription={daoDescription}
				/>
			)}
			<ClaimNftSuccessContainer
				protocol={protocol}
				hostname={hostname}
				daoName={daoName}
				artwork={artwork}
				daoAddress={daoAddress}
				tokenId={tokenId}
				userId={userId}
				isSharingEnabled={isSharingEnabled}
			/>
		</>
	);
};

Success.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const tier = ctx.query?.tier;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);
	const [_, user] = await checkAuth(ctx);

	const protocol = getProtocol(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao?.contractAddress || !isString(tier)) return { notFound: true };

	const isSharingEnabled = getIsFeatureEnabled(FEATURES.SHARING_PREVIEW, ctx);

	const [mintedNftMeta, allArtworksQuery] = await Promise.all([
		useGetMintedNftMetaQuery.fetcher({ daoAddress: dao.contractAddress, tier })(),
		useCollectionArtworksQuery.fetcher({ daoAddress: dao.contractAddress, tier })()
	]);

	const { artworkId, tokenId } = mintedNftMeta?.getMintedNftMeta || {};
	const artworks = allArtworksQuery?.collectionArtworks.artworks;
	const artwork = artworks?.[artworkId!] || null;

	return {
		props: {
			...getProps(),
			protocol,
			daoName: dao.name,
			daoAddress: dao.contractAddress,
			daoDescription: dao.description,
			userId: user?.id,
			isSharingEnabled,
			artwork,
			artworkId,
			tokenId
		}
	};
});

export default Success;
