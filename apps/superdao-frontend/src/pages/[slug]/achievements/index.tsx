import { Redirect } from 'next';
import { SSR } from 'src/client/ssr';
import { PageContent } from 'src/components';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	userId: string;
	isMobile: boolean;
};

const Achievements: NextPageWithLayout<Props> = (props) => {
	const { slug } = props;

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	if (!daoBySlug) return null;

	return <PageContent />;
};

Achievements.getLayout = getDaoLayout;

export default Achievements;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;

	if (typeof slug !== 'string') return { notFound: true };

	const leaderboardPage: Redirect = {
		destination: `/${slug}/achievements/leaderboard`,
		permanent: false
	};

	return { redirect: leaderboardPage };
});
