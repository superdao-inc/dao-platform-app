import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import { LevelComponent } from 'src/pagesComponents/achievements/shared/level';
import { MobileLevelProgress } from 'src/pagesComponents/achievements/myProfile/mobilelevelPropgress';
import { getMyProfileClass } from 'src/pagesComponents/achievements/myProfile/styles';
import { LevelProgress } from 'src/pagesComponents/achievements/myProfile/levelProgress';

type Props = {
	isMobile?: boolean;
	currentUserLevel: number;
	xpNeeded: number;
	xp: number;
};

export const UserLevelLeftElem: FC<Props> = ({ xpNeeded, currentUserLevel, xp, isMobile = false }) => {
	const { userLevelLeftContainer, userLevelText } = getMyProfileClass(isMobile);
	const { t } = useTranslation();

	return (
		<>
			{isMobile ? (
				<div className={userLevelLeftContainer}>
					<div>
						<LevelComponent
							level={currentUserLevel}
							className="!h-[32px] !w-[32px] after:!ml-1 after:!h-[24px] after:!w-[24px]"
						/>
					</div>
					<div className=" flex w-full min-w-[116px] flex-col items-start gap-1 p-0">
						<MobileLevelProgress expNeeded={xpNeeded} currentExp={xp} />
					</div>
				</div>
			) : (
				<>
					<div className={userLevelLeftContainer}>
						<div>
							<LevelComponent level={currentUserLevel} className="after:!h-[30px] after:!w-[30px]" bigSize={true} />
						</div>
						<div className={userLevelText}>{t('pages.myProfile.levels.levelInfo.level')}</div>
					</div>
					<LevelProgress expNeeded={xpNeeded} currentExp={xp} level={currentUserLevel} />
				</>
			)}
		</>
	);
};
