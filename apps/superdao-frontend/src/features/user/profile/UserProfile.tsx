import { memo } from 'react';
import { useIsCurrentUser, useCurrentUserNewNftsNotifications, useUserNftsQuery } from 'src/features/user/hooks';
import { UserProfileNotification } from 'src/features/user/profile/notification/';
import { UserProfileNfts } from 'src/features/user/profile/nfts';
import { Loader, LoaderWrapper } from 'src/components';
import { UserProfileHead } from 'src/features/user/profile/head';
import { UserProfileDaos } from 'src/features/user/profile/daos';
import { PublicUserFragment, useUserDaoParticipationQuery } from 'src/gql/user.generated';

type UserProfileProps = {
	user: PublicUserFragment;

	isDaoTab?: boolean;
	daosLinkPath: string;
	nftsBackLinkPath: string;
};

const UserProfile = (props: UserProfileProps) => {
	const { user, isDaoTab = false, daosLinkPath, nftsBackLinkPath } = props;
	const { id: userId } = user;

	const { items: userDaos } = useUserDaoParticipationQuery({ userId })?.data?.daoParticipation || {};

	const { data: nftsData, isLoading: isUserNftsDataLoading } = useUserNftsQuery({ userId });
	const { userNfts } = nftsData || {};

	const isCurrentUserProfile = useIsCurrentUser(userId);
	const nftNotifications = useCurrentUserNewNftsNotifications({ enabled: isCurrentUserProfile });

	return (
		<>
			{isCurrentUserProfile && !!userNfts?.length && !!nftNotifications?.length && (
				<UserProfileNotification nftNotifications={nftNotifications} userNfts={userNfts} />
			)}

			<UserProfileHead user={user} />

			{userDaos && (
				<UserProfileDaos
					user={user}
					userDaos={userDaos}
					isDaoTab={isDaoTab}
					daosLinkPath={daosLinkPath}
					className="mt-6"
				/>
			)}

			{isUserNftsDataLoading ? (
				<LoaderWrapper className="mt-7">
					<Loader size="xl" />
				</LoaderWrapper>
			) : (
				userNfts && (
					<UserProfileNfts
						userId={userId}
						userNfts={userNfts}
						nftNotifications={nftNotifications}
						nftsBackLinkPath={nftsBackLinkPath}
						isDaoTab={isDaoTab}
						className="mt-7"
					/>
				)
			)}
		</>
	);
};

export default memo(UserProfile);
