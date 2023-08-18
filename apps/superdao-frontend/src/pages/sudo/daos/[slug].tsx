import { useRouter } from 'next/router';
import { prefetchData, SSR, checkSupervisorAuth } from 'src/client/ssr';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';
import { SudoDaoEditing } from 'src/features/sudo/daoEditing/containers/sudoDaoEditing';

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export const DAOSupervisionPage = () => {
	const { query } = useRouter();
	const slug = typeof query.slug === 'string' ? query.slug : '';

	return (
		<SudoLayout>
			<SudoDaoEditing slug={slug} />
		</SudoLayout>
	);
};

export default DAOSupervisionPage;
