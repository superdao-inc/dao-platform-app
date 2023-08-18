import { FC } from 'react';
import cn from 'classnames';
import { Body } from 'src/components/text';
import { getLevelTitleClass } from 'src/pagesComponents/achievements/levelmap/style';

type Props = {
	text: string;
	isMobile?: boolean;
};

export const LastLevelStub: FC<Props> = ({ text, isMobile = false }) => {
	const { levelTitleTextClass } = getLevelTitleClass(isMobile);
	return (
		<div className="flex-column relative flex items-center">
			<div
				className={cn(
					'bg-backgroundSecondary absolute inset-x-1/2 top-[45px] flex h-[40px] w-[95%] translate-x-[-50%] flex-col items-center rounded-xl p-5 opacity-50',
					isMobile ? 'h-[26px]' : 'h-[40px]'
				)}
			></div>
			<div
				className={cn(
					'bg-backgroundSecondary absolute inset-x-1/2 top-[46px] flex h-[50px] w-[90%] translate-x-[-50%] flex-col items-center rounded-xl p-5 opacity-50',
					isMobile ? 'h-[36px]' : 'h-[50px]'
				)}
			></div>
			<div
				className={cn(
					'bg-backgroundSecondary flex  w-full flex-col items-center rounded-xl p-5',
					isMobile ? 'h-[56px]' : ' h-[72px]'
				)}
			>
				<Body className={levelTitleTextClass}>{text}</Body>
			</div>
		</div>
	);
};
