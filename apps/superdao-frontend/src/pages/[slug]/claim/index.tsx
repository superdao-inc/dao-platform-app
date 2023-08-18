import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { NftClaimContainer } from 'src/features/claim/nft';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';

const NftClaim: NextPageWithLayout<{}> = () => {
	return <NftClaimContainer />;
};

NftClaim.getLayout = getDaoLayout;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	if (!ctx.query.tier) {
		return {
			notFound: true
		};
	}

	return { props: { ...getProps() } };
});

export default NftClaim;
