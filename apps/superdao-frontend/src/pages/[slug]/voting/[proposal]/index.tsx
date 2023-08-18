import { SSR, prefetchData, SSRAuthMiddleware } from 'src/client/ssr';
import { getCurrentUserAsMember, getProposal } from 'src/client/commonRequests';
import { VotingProposal } from 'src/features/voting/proposal';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';

type Props = {
	daoId: string;
	slug: string;
	proposal: string;
};

const DaoProposalPage: NextPageWithLayout<Props> = ({ daoId, slug, proposal }) => {
	return <VotingProposal daoId={daoId} slug={slug} proposal={proposal} />;
};

DaoProposalPage.getLayout = getDaoLayout;

export default DaoProposalPage;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const { proposal: proposalId } = ctx.query;
	const slug = ctx.params?.slug;
	const userId = ctx.req.session?.userId;
	if (typeof slug !== 'string' || typeof proposalId !== 'string') return { notFound: true };

	const [queryClient, getProps] = await prefetchData(ctx);

	const proposal = await getProposal(queryClient, ctx, { proposalId });
	if (!proposal) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: proposal.dao.id, userId });
	if (!userAsMember) return { notFound: true };

	return {
		props: {
			daoId: proposal.dao.id,
			slug: slug,
			proposal: proposalId,
			...getProps()
		}
	};
});
