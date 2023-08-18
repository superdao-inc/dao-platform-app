import cn from 'classnames';
import { FC } from 'react';
import { DoneCircle } from './doneCircle';
type Props = {
	levels: number;
	isMobile?: boolean;
};

export const LevelIconStack: FC<Props> = ({ levels, isMobile = false }) => {
	if (levels === 1) return <DoneCircle isMobile={isMobile} />;
	return (
		<div className="relative mr-2 w-[25px]">
			{Array(levels)
				.fill(() => '')
				.map((_, index) => (
					<div
						key={index}
						className={cn(
							`border-backgroundSecondary absolute rounded-full border-2 right-${
								levels - index + 1
							} translate-y-[-50%] translate-x-[50%]`
						)}
					>
						<DoneCircle isMobile={isMobile} />
					</div>
				))}
		</div>
	);
};
