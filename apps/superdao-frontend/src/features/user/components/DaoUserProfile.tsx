import { UserAPI } from 'src/features/user/API';
import { UserProfileHead } from 'src/features/user/profile/head';

type Props = {
	slug: string;
	userId: string;
};

export const DaoUserProfile = ({ slug, userId }: Props) => {
	const { data: user } = UserAPI.useUserByIdOrSlugQuery({ idOrSlug: slug });
	const { userByIdOrSlug: userData } = user || {};

	const { data: participation } = UserAPI.useUserDaoParticipationQuery({ userId });
	const { daoParticipation: userDaosData } = participation || {};

	if (!userData || !userDaosData) return null;

	return <UserProfileHead user={userData} />;
};
