import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import { Body } from 'src/components';
import { getMyProfileClass } from 'src/pagesComponents/achievements/myProfile/styles';

type Props = {
	expNeeded: number;
	currentExp: number;
};

export const MobileLevelProgress: FC<Props> = ({ expNeeded, currentExp }) => {
	const { t } = useTranslation();

	const { userLevelText } = getMyProfileClass(true);

	const progress = (100 / expNeeded) * currentExp;
	const progressStyle = { width: `${progress}%` };
	return (
		<>
			<Body className="text-foregroundSecondary flex min-w-[100px] flex-row items-start gap-1.5 p-0 tracking-[-0.24px]">
				<div className={userLevelText}>{t('pages.achievements.profile.levels.levelInfo.level')}</div>
				<div className="text-[13px] font-normal leading-[18px]">
					{currentExp} / {expNeeded} {t('pages.achievements.profile.levels.levelInfo.exp')}
				</div>
			</Body>
			<div className="bg-tintOrange/15 h-[8px] w-full rounded-full">
				<div style={progressStyle} className="bg-tintOrange h-[8px] w-0 rounded-full"></div>
			</div>
		</>
	);
};
