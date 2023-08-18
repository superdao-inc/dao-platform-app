import { useRouter } from 'next/router';
import { isString } from '@sd/superdao-shared';
import { SSR, prefetchData } from 'src/client/ssr';
import { UserUI } from 'src/features/user';
import { SharingAddon } from 'src/features/user/components/sharingAddon';
import { getUserNftSharingProps } from 'src/server/commonRequests';
import { NextPageWithLayout } from 'src/layouts';
import { getUserByIdOrSlug } from 'src/client/commonRequests';
import { getUserLayout } from 'src/layouts/user';

type Props = {
	daoAddress: string;
	slug: string;
	daoName: string;
	tierName: string;
	tokenId: string;
	tierId: string;
	isSharingEnabled: boolean;
	isCurrentUser: boolean;
	userSlug: string;
	userId: string;
	protocol: string;
	hostname: string;
};

const UserNftPage: NextPageWithLayout<Props> = (props) => {
	const { slug, daoName, tierName, tierId, protocol, hostname, userSlug, userId, isCurrentUser } = props;
	const { asPath } = useRouter();

	const fullUrl = protocol + hostname + asPath;

	return (
		<>
			<SharingAddon
				fullUrl={fullUrl}
				daoName={daoName}
				tier={tierName}
				tierId={tierId}
				hostname={hostname}
				protocol={protocol}
				isCurrentUser={isCurrentUser}
				slug={slug as string}
			/>

			<UserUI.UserNft backPath={`/users/${userSlug || userId}`} fullUrl={fullUrl} {...props} />
		</>
	);
};

UserNftPage.getLayout = getUserLayout;

export default UserNftPage;

export const getServerSideProps = SSR(async (ctx) => {
	const idOrSlug = ctx.params?.idOrSlug;
	if (!isString(idOrSlug)) return { notFound: true };

	const [queryClient, getProps] = await prefetchData(ctx);

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug });
	if (!userByIdOrSlug) return { notFound: true };

	const { daoAddress, slug, daoName, tokenId, tierId, tierName, isSharingEnabled, protocol, isCurrentUser } =
		(await getUserNftSharingProps(queryClient, ctx, idOrSlug)) || {};

	if (isCurrentUser) {
		return {
			redirect: {
				destination: `/profile/${daoAddress}/${tokenId}`,
				permanent: false
			}
		};
	}

	return {
		props: {
			daoAddress,
			slug,
			daoName,
			tokenId,
			tierId,
			tierName,
			isSharingEnabled,
			isCurrentUser,
			userSlug: userByIdOrSlug.slug,
			userId: userByIdOrSlug.id,
			protocol,
			...getProps()
		}
	};
});
