import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FC } from 'react';
import { useRouter } from 'next/router';
import { Body } from 'src/components';
import { useGetAchievementsUserProgressQuery } from 'src/gql/achievements.generated';
import { RoadmapbonusObject } from 'src/types/types.generated';
import { BonusInfo } from './bonusInfo';
import { LevelAccordion } from './levelAccordion';
import { LevelTitle } from './levelTitle';
import { LastLevelStub } from './lastLevelStub';

type Props = {
	daoId: string;
	userId: string;
	isMobile: boolean;
};

export const LevelMapPageContent: FC<Props> = ({ daoId, userId, isMobile }) => {
	const { data, isLoading } = useGetAchievementsUserProgressQuery({ daoId, userId });

	const { t } = useTranslation();
	const {
		query: { slug }
	} = useRouter();

	if (isLoading || !data) return null;

	const {
		getAchievementsUserProgress: { level: userLevel, levelsRoadmap, xp }
	} = data;

	const groupedLevels = levelsRoadmap.reduce(
		(grouped, level, idx) => {
			const roadmapLevel = idx + 1;
			if (userLevel > roadmapLevel) {
				grouped[0].levels.push(roadmapLevel);
				grouped[0].bonuses.push(...level.bonuses);
				grouped[0].expNeeded += level.xpNeeded;
			} else {
				grouped.push({ levels: [roadmapLevel], bonuses: [...level.bonuses], expNeeded: level.xpNeeded });
			}

			return grouped;
		},
		[{ levels: [] as number[], bonuses: [] as RoadmapbonusObject[], expNeeded: 0 }]
	);

	return (
		<>
			<Body>
				{t('pages.achievements.levels.levelInfo.roadmapTip')}{' '}
				<span className="text-accentPrimary">
					{<Link href={`/${slug}/achievements/all`}>{t('pages.achievements.levels.levelInfo.roadmapTipLink')}</Link>}
				</span>
			</Body>
			{groupedLevels.map(({ levels, bonuses, expNeeded }, index) => {
				if (levels.length === 0) return null;
				const nextLevelExpNeeded = groupedLevels[index + 1]?.expNeeded;
				const isCurrentLevel = levels.length === 1 && levels[0] === userLevel;
				const isCompleted = Math.max(...levels) <= userLevel;
				return (
					<div className="my-5" key={index}>
						<LevelAccordion
							initialOpen={isCurrentLevel}
							isMobile={isMobile}
							title={
								<LevelTitle
									bonuses={bonuses.length}
									currentLevel={userLevel}
									levels={levels}
									expNeeded={(isCurrentLevel && nextLevelExpNeeded) || expNeeded}
									userExp={xp}
									isMobile={isMobile}
								/>
							}
						>
							<div className="mt-6 flex flex-col gap-4">
								{bonuses.map(({ title, description, image }) => (
									<BonusInfo
										key={title}
										title={title}
										description={description}
										image={image}
										isCompleted={isCompleted}
										isMobile={isMobile}
									/>
								))}
							</div>
						</LevelAccordion>
					</div>
				);
			})}
			<LastLevelStub text={t('pages.achievements.levels.levelInfo.lastLevelStub')} />
		</>
	);
};
