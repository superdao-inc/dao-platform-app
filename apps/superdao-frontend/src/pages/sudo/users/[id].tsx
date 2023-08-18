import { useRouter } from 'next/router';
import { prefetchData, SSR, checkSupervisorAuth } from 'src/client/ssr';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';
import { PageLoader } from 'src/components';
import { useUserByIdOrSlugQuery } from 'src/gql/user.generated';
import { SudoUserForm } from 'src/features/sudo/userEditing/containers/sudoUserForm';

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export const DAOSupervisionPage = () => {
	const { query } = useRouter();
	const id = typeof query.id === 'string' ? query.id : '';

	const { data, isLoading } = useUserByIdOrSlugQuery({ idOrSlug: id });
	const { userByIdOrSlug } = data || {};

	if (isLoading) {
		return (
			<SudoLayout>
				<PageLoader />
			</SudoLayout>
		);
	}

	if (!userByIdOrSlug) {
		return (
			<SudoLayout>
				<p className="text-3xl text-white">Dao not found</p>
			</SudoLayout>
		);
	}

	return (
		<SudoLayout>
			<SudoUserForm userByIdOrSlug={userByIdOrSlug} />
		</SudoLayout>
	);
};

export default DAOSupervisionPage;
