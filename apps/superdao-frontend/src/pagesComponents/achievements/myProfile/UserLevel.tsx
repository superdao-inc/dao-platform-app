import { FC } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { MapIcon } from 'src/components';
import { getMyProfileClass } from 'src/pagesComponents/achievements/myProfile/styles';

import { useGetAchievementsUserProgressQuery } from 'src/gql/achievements.generated';
import { UserLevelLeftElem } from 'src/pagesComponents/achievements/myProfile/UserLevelLeftElem';

type Props = {
	daoId: string;
	userId: string;
	isMobile?: boolean;
};

export const UserLevel: FC<Props> = ({ daoId, userId, isMobile = false }) => {
	const { userLevel, userLevelContainer, userLevelLeft, userLevelRight, userLevelButton, userLevelButtonText } =
		getMyProfileClass(isMobile);

	const { data, isLoading } = useGetAchievementsUserProgressQuery({ daoId, userId });

	const { t } = useTranslation();
	const {
		query: { slug }
	} = useRouter();

	if (isLoading || !data) return null;

	const {
		getAchievementsUserProgress: { level: currentUserLevel, levelsRoadmap, xp }
	} = data;

	if (levelsRoadmap.length === 0 || !levelsRoadmap[currentUserLevel - 1]) return null;
	const { xpNeeded } = levelsRoadmap[currentUserLevel] || levelsRoadmap[currentUserLevel - 1];

	return (
		<>
			<div className={userLevel}>
				<div className={userLevelContainer}>
					<div className={userLevelLeft}>
						<UserLevelLeftElem xpNeeded={xpNeeded} currentUserLevel={currentUserLevel} xp={xp} isMobile={isMobile} />
					</div>
					<div className={userLevelRight}>
						<Link href={`/${slug}/achievements/levels`} passHref>
							<a className={userLevelButton}>
								{!isMobile && <MapIcon width={16} height={16} fill="#717A8C" />}
								<span className={userLevelButtonText}>{t('pages.myProfile.levels.title')}</span>
							</a>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};
