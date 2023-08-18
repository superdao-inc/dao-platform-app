import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';

import { UserUI } from 'src/features/user';
import { getProfileLayout, NextPageWithLayout } from 'src/layouts';

type Props = {
	hostname: string;
};

const ProfileAbout: NextPageWithLayout<Props> = () => {
	return <UserUI.ProfileAbout />;
};

ProfileAbout.getLayout = getProfileLayout;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export default ProfileAbout;
