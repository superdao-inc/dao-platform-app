import { SSR, SSRAuthMiddleware } from 'src/client/ssr';

const Index = () => null;

export default Index;

export const getServerSideProps = SSR(SSRAuthMiddleware, async () => {
	return {
		redirect: {
			destination: '/profile',
			permanent: false
		}
	};
});
