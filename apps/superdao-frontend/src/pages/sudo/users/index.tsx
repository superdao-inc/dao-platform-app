import { NextPage } from 'next';

import { checkSupervisorAuth, prefetchData, SSR } from 'src/client/ssr';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';
import { SudoUserList } from 'src/features/sudo/userList/containers/sudoUserList';

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);
	return { props: getProps() };
});

const UsersSupervisionPage: NextPage = () => (
	<SudoLayout>
		<SudoUserList />
	</SudoLayout>
);

export default UsersSupervisionPage;
