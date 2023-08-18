import { prefetchData, SSR } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoVerificationStatus, getDaoWithRoles } from 'src/client/commonRequests';
import { UserAPI } from 'src/features/user/API';

import { featureToggles } from 'src/server/featureToggles.service';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { getProtocol } from 'src/utils/protocol';

import { PageContent } from 'src/components';
import { CustomHead } from 'src/components/head';
import { DaoProfile } from 'src/features/daoProfile';
import { PublicDaoFragment } from 'src/gql/daos.generated';

type Props = {
	dao: PublicDaoFragment;
	isDaoVerified: boolean;
	isShowcaseVisible: boolean;

	protocol: string;
	hostname: string;
};

const DaoPage: NextPageWithLayout<Props> = (props) => {
	const { dao, hostname, protocol, isShowcaseVisible, isDaoVerified } = props;
	const { name, description } = dao;

	return (
		<PageContent>
			<CustomHead
				main={name}
				description={description}
				addon={hostname ? <link rel="canonical" href={hostname} /> : null}
			/>

			<DaoProfile
				dao={dao}
				isDaoVerified={isDaoVerified}
				isShowcaseVisible={isShowcaseVisible}
				hostname={hostname}
				protocol={protocol}
			/>
		</PageContent>
	);
};

DaoPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const userId = ctx.req.session?.userId;
	const slug = ctx.params?.slug;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const isDaoVerified = await getDaoVerificationStatus(queryClient, ctx, { daoId: dao.id });

	if (isAuthorized) {
		await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });
	} else {
		queryClient.setQueryData(UserAPI.useUserAsMemberQuery.getKey({ daoId: dao.id, userId: '' }), null);
	}

	const isShowcaseVisible = featureToggles.isEnabled('treasury_showcase');

	const protocol = getProtocol(ctx);

	return {
		props: {
			dao,
			isDaoVerified,
			isShowcaseVisible,
			protocol,
			hostname: ctx.req.headers.host || null,
			...getProps()
		}
	};
});

export default DaoPage;
