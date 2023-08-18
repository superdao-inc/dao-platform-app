import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { Body } from 'src/components';
import { basicColors, darkenColors } from 'src/pagesComponents/achievements/shared/constants';

type Props = {
	expNeeded: number;
	currentExp: number;
	level: number;
};

export const LevelProgress: FC<Props> = ({ expNeeded, currentExp, level }) => {
	const { t } = useTranslation();
	const progress = Math.min((100 / expNeeded) * currentExp, 100);

	return (
		<>
			<ScaleProgress
				basicColors={basicColors[level]}
				darkenColors={darkenColors[level]}
				className="progress mx-5 h-[8px] w-full rounded-full"
			>
				<ScaleProgressCurrent
					basicColors={basicColors[level]}
					darkenColors={darkenColors[level]}
					progress={progress}
				></ScaleProgressCurrent>
			</ScaleProgress>
			<Body className="text-foregroundSecondary min-w-[100px] pl-2 tracking-[-0.24px]">
				{currentExp} / {expNeeded} {t('pages.myProfile.levels.levelInfo.exp')}
			</Body>
		</>
	);
};

export const ScaleProgressCurrent = styled.div<{ basicColors: string; darkenColors: string; progress: number }>`
	background: #1b202a;
	opacity: 0.5;
	height: 8px;
	border-radius: 9999px;
	&:after {
		content: '';
		width: ${(props) => ` ${props.progress}%;`} 
		height: 8px;
		background: ${(props) => `linear-gradient(135deg, ${props.basicColors} 0%, ${props.darkenColors} 100%);`};
		display: block;
		border-radius: 9999px;
	}
`;

export const ScaleProgress = styled.div<{ basicColors: string; darkenColors: string }>`
	background: ${(props) => `linear-gradient(135deg, ${props.basicColors} 0%, ${props.darkenColors} 100%);`};
`;
