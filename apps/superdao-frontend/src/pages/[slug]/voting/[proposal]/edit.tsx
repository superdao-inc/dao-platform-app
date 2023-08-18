import { useRouter } from 'next/router';
import { prefetchData, SSR } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { useUserAsMemberQuery } from 'src/gql/daoMembership.generated';
import { VotingSettings } from 'src/features/voting/settings';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';

type Props = {
	slug: string;
	daoId: string;
};

const VotingEdit: NextPageWithLayout<Props> = ({ slug, daoId }) => {
	const { query } = useRouter();
	const { proposal } = query;

	return <VotingSettings slug={slug} daoId={daoId} proposalId={proposal as string | undefined} />;
};

VotingEdit.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const userId = ctx.req.session?.userId;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	if (isAuthorized) {
		await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });
	} else {
		queryClient.setQueryData(useUserAsMemberQuery.getKey({ daoId: dao.id, userId }), null);
	}

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			...getProps()
		}
	};
});

export default VotingEdit;
