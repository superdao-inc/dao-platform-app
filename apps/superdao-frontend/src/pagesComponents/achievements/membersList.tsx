import { MemberRow } from './memberRow';
import { DaoMemberRole } from 'src/types/types.generated';
import { AchievementUserFragment, AchievementNftFragment } from 'src/gql/achievements.generated';

type Props = {
	members?: {
		level: number;
		role: DaoMemberRole;
		achievementNFTsCount: number;
		roadmapLevelsCount: number;
		user: AchievementUserFragment;
		achievementNFTs: AchievementNftFragment[];
		xp: number;
	}[];
	daoSlug: string;
};

export const MembersList = (props: Props) => {
	const { members, daoSlug } = props;

	if (!members) return null;

	return (
		<div className="scrollbar-hide lg:desktop-has-more-content relative overflow-scroll px-4 lg:px-0">
			{members?.map((member) => {
				const isClaimed = member?.user?.isClaimed;
				return <MemberRow key={member?.user?.id} daoSlug={daoSlug} member={member} isClaimed={isClaimed || false} />;
			})}
		</div>
	);
};
