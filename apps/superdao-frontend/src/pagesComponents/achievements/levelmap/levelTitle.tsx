import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import { Body } from 'src/components';
import { LevelComponent } from '../shared/level';

import { MobileLevelComponent } from '../shared/mobileLevel';
import { LevelIconStack } from './levelIconStack';
import { LevelProgress } from './levelProgress';
import { getLevelTitleClass } from 'src/pagesComponents/achievements/levelmap/style';

type Props = {
	levels: number[];
	bonuses: number;
	currentLevel: number;
	expNeeded: number;
	userExp: number;
	isMobile?: boolean;
};

const pretifyLevels = (levels: number[]) => {
	const levelsAmount = levels.length;
	if (levelsAmount === 0) return '';
	if (levelsAmount === 1) return String(levels[0]);
	if (levelsAmount === 2) return levels.join(', ');

	return `${levels[0]} - ${levels[levelsAmount - 1]}`;
};

export const LevelTitle: FC<Props> = ({ levels, bonuses, currentLevel, expNeeded, userExp, isMobile = false }) => {
	const { t } = useTranslation();

	const { levelTitleTextClass } = getLevelTitleClass(isMobile);

	if (Math.max(...levels) < currentLevel)
		return (
			<div className="flex grow flex-row items-center justify-start">
				<LevelIconStack levels={levels.length} isMobile={isMobile} />
				<Body className={levelTitleTextClass}>
					<div className="flex grow flex-row items-center justify-start">
						{pretifyLevels(levels)} {t('pages.achievements.levels.levelInfo', { count: levels.length })}
						{' · '}
						{t('pages.achievements.levels.levelInfo.bonusesCount', { count: bonuses })}
					</div>
				</Body>
			</div>
		);

	if (currentLevel === levels[0]) {
		return (
			<div className="flex grow flex-row items-center justify-start">
				<div>{isMobile ? <MobileLevelComponent level={levels[0]} /> : <LevelComponent level={levels[0]} />}</div>
				<Body className={levelTitleTextClass}>{t('pages.achievements.levels.levelInfo.levelTitle')}</Body>
				<LevelProgress level={currentLevel} expNeeded={expNeeded} currentExp={userExp} />
			</div>
		);
	}
	return (
		<div className="flex grow flex-row items-center justify-start">
			<div>{isMobile ? <MobileLevelComponent level={levels[0]} /> : <LevelComponent level={levels[0]} />}</div>
			<Body className="text-foregroundSecondary pl-2">
				{t('pages.achievements.levels.levelInfo.levelTitle')} · {expNeeded}{' '}
				{t('pages.achievements.levels.levelInfo.exp')}
			</Body>
		</div>
	);
};
