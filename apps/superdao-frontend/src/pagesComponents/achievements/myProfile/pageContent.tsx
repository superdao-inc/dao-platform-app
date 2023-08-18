import { FC } from 'react';
import { DaoUserProfile } from 'src/features/user/components/DaoUserProfile';
import { UserLevel } from 'src/pagesComponents/achievements/myProfile/UserLevel';
import { Spacer } from 'src/components';
import { UserProfileAchievements } from 'src/pagesComponents/achievements/myProfile/userProfileAchievements';

type Props = {
	userId: string;
	slugId: string;
	daoId: string;
	slug: string;
	currentUserAddress?: string;
	userAddress: string;
	daoAddress: string;
	isMobile: boolean;
	isLeaderBoardTab?: boolean;
};

export const ProfileContent: FC<Props> = (props) => {
	const {
		userId,
		slugId,
		daoId,
		daoAddress,
		userAddress,
		currentUserAddress,
		slug,
		isMobile = false,
		isLeaderBoardTab = false
	} = props;

	return (
		<>
			<DaoUserProfile userId={userId} slug={slugId} />
			<Spacer height={24} />
			<UserLevel userId={userId} daoId={daoId} isMobile={isMobile} />
			<Spacer height={24} />
			<UserProfileAchievements
				isMobile={isMobile}
				currentUserAddress={currentUserAddress}
				userAddress={userAddress}
				slug={slug}
				daoAddress={daoAddress}
				isLeaderBoardTab={isLeaderBoardTab}
			/>
		</>
	);
};
