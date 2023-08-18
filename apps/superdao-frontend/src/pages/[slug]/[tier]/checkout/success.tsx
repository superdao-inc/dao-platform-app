import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { FEATURES, isString } from '@sd/superdao-shared';

import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { getIsFeatureEnabled } from 'src/server/featureToggles.service';
import { CheckoutSuccessContainer } from 'src/features/checkout/success/container/checkoutSuccess';
import { CheckoutCommonFetchingContainer } from 'src/features/checkout/internal/containers/checkoutCommonFetchingContainer';
import { CheckoutFeatureContextProvider } from 'src/features/checkout/internal/components/featureProvider';
import { getProtocol } from 'src/utils/protocol';
import { getDaoWithRoles } from 'src/client/commonRequests';
import { SharingAddon } from 'src/features/checkout/success/components/sharingAddon';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { CheckoutCommonValidatingContainer } from 'src/features/checkout/internal/containers/checkoutCommonValidatingContainer';
import { CheckoutPageLoader } from 'src/features/checkout/internal/components/checkoutPageLoader';
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

const Success: NextPageWithLayout<Props> = (props) => {
	const {
		hostname,
		protocol,
		daoName,
		daoDescription,
		isSharingEnabled,
		artworkId,
		artwork,
		userId,
		daoAddress,
		tokenId
	} = props;

	const { t } = useTranslation();
	const title = t('pages.checkout.success.heading');
	const metaTitle = t('pages.checkout.success.metaTitle');

	const { asPath, query } = useRouter();
	let { slug, tier } = query;
	tier = tier as string;

	const fullUrl = protocol + hostname + asPath;

	return (
		<CheckoutFeatureContextProvider {...props}>
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
			<CheckoutCommonFetchingContainer pageLoaderComponent={<CheckoutPageLoader metaTitle={metaTitle} title={title} />}>
				<CheckoutCommonValidatingContainer>
					<CheckoutSuccessContainer
						protocol={protocol}
						hostname={hostname}
						daoName={daoName}
						artwork={artwork}
						isSharingEnabled={isSharingEnabled}
						userId={userId}
						daoAddress={daoAddress}
						tokenId={tokenId}
					/>
				</CheckoutCommonValidatingContainer>
			</CheckoutCommonFetchingContainer>
		</CheckoutFeatureContextProvider>
	);
};

Success.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const { tier } = ctx.query;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const isSharingEnabled = getIsFeatureEnabled(FEATURES.SHARING_PREVIEW, ctx);
	const [_, user] = await checkAuth(ctx);

	const protocol = getProtocol(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);

	if (!dao?.contractAddress || !isString(tier)) return { notFound: true };

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
			daoDescription: dao.description,
			daoAddress: dao.contractAddress,
			userId: user?.id,
			tokenId,
			artworkId,
			artwork,
			isSharingEnabled
		}
	};
});

export default Success;
