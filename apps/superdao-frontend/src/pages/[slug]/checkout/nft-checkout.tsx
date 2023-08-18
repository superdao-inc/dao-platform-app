import { SSR } from 'src/client/ssr';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { getDaoCheckoutRedirect } from 'src/utils/redirects';

const EmptyPage: NextPageWithLayout<{}> = () => {
	return null;
};

EmptyPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.query?.slug;
	const tier = ctx.query?.tier;

	if (typeof slug !== 'string' || typeof tier !== 'string') return { notFound: true };

	return getDaoCheckoutRedirect(slug, tier);
});

export default EmptyPage;
