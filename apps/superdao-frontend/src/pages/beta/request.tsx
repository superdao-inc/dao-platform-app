import { NextPage } from 'next';
import { prefetchData, SSR } from 'src/client/ssr';
import { PageContent, RequestBetaAccessModal } from 'src/components';
import { CustomHead } from 'src/components/head';

const Request: NextPage = () => {
	return (
		<PageContent>
			<CustomHead main={'Beta access'} additional={'Superdao'} description={'Request access to create DAO'} />

			<RequestBetaAccessModal isOpen onClose={() => window.history.back()} />
		</PageContent>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export default Request;
