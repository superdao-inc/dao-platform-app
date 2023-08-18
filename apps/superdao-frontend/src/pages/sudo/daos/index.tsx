import { prefetchData, SSR, checkSupervisorAuth } from 'src/client/ssr';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';
import { SudoDaoList } from 'src/features/sudo/daoList/containers/sudoDaoList';

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export const DAOSupervisionPage = () => (
	<SudoLayout>
		<SudoDaoList />
	</SudoLayout>
);

export default DAOSupervisionPage;
