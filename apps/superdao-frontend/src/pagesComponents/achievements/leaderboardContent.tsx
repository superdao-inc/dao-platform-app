import { useTranslation } from 'next-i18next';

import { MembersList } from './membersList';

import { Label3 } from 'src/components';
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

export const LeaderboardContent = (props: Props) => {
	const { daoSlug, members } = props;
	const { t } = useTranslation();

	return (
		<>
			<div className="mb-1 flex px-4 lg:px-3">
				<Label3 className="text-foregroundSecondary flex grow-0 basis-8/12 font-thin lg:basis-2/5 lg:font-semibold">
					{t('pages.dao.members.columns.member')}
				</Label3>
				<Label3 className="text-foregroundSecondary hidden flex-1 lg:block lg:basis-0">
					{t('components.achievements.leaderboard.role')}
				</Label3>
				<Label3 className="text-foregroundSecondary flex-1 basis-1/12 text-end font-thin lg:basis-0 lg:font-semibold">
					{t('components.achievements.leaderboard.xp')}
				</Label3>
				<Label3 className="text-foregroundSecondary hidden flex-1 text-right lg:block">
					{t('components.achievements.leaderboard.level')}
				</Label3>
				<Label3 className="text-foregroundSecondary block flex-1 basis-1/12 text-right font-thin lg:hidden">
					{t('components.achievements.leaderboard.lvl')}
				</Label3>
			</div>
			<MembersList members={members} daoSlug={daoSlug} />
		</>
	);
};
