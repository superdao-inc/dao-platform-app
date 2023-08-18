import { getDaoPreviewById } from 'src/client/commonRequests';
import { checkAuth, prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { DaoMention } from 'src/components/TextareaMentionEditor';

import { UserUI } from 'src/features/user';
import { PublicUserFragment } from 'src/gql/user.generated';
import { getProfileLayout, NextPageWithLayout } from 'src/layouts';
import { scanDaoIdsInBio } from 'src/utils/bio';

type Props = {
	currentUser: PublicUserFragment;
	daoMentions: DaoMention[];
	hostname: string;
};

const EditProfile: NextPageWithLayout<Props> = (props) => {
	const { currentUser, daoMentions, hostname } = props;

	return <UserUI.ProfileEdit currentUser={currentUser} daoMentions={daoMentions} hostname={hostname} />;
};

// FIXME: secondary navigation ре-рендерится при переходе на эту страницу
EditProfile.getLayout = getProfileLayout;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [queryClient, getProps] = await prefetchData(ctx);
	const [, currentUser] = await checkAuth(ctx);

	const daoIds = currentUser?.bio ? scanDaoIdsInBio(currentUser.bio) : [];

	const daoResponses = await Promise.allSettled(
		daoIds.map(async (daoId) => {
			const daoData = await getDaoPreviewById(queryClient, ctx, { id: daoId });

			return daoData;
		})
	);

	let daoMentions: DaoMention[] = [];
	for (const res of daoResponses) {
		if (res.status === 'rejected' || !res.value) continue;
		const { id, slug, avatar } = res.value;

		daoMentions.push({ id, name: slug ?? '', avatar: avatar ?? '' });
	}

	return { props: { currentUser, daoMentions, ...getProps() } };
});

export default EditProfile;
