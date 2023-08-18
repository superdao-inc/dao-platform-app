import { FC } from 'react';
import { Body } from 'src/components';
import { basicColors } from 'src/pagesComponents/achievements/shared/constants';

type Props = {
	expNeeded: number;
	currentExp: number;
	level: number;
};

export const LevelProgress: FC<Props> = ({ expNeeded, currentExp, level }) => {
	const progress = Math.min((100 / expNeeded) * currentExp, 100);

	const progressStyle = { width: `${progress}%`, backgroundColor: basicColors[level] };
	const progressContainerStyle = { backgroundColor: `${basicColors[level]}26` };

	return (
		<>
			<div style={progressContainerStyle} className="mx-5 h-[8px] w-full rounded-full">
				<div style={progressStyle} className="h-[8px] w-0 rounded-full"></div>
			</div>
			<Body className="text-foregroundSecondary min-w-[100px] pl-2">
				{currentExp} / {expNeeded} XP
			</Body>
		</>
	);
};
