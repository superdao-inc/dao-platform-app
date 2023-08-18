import cn from 'classnames';
import { FC, ReactNode, useState } from 'react';
import { ChevronDown } from 'src/components';
import { getLevelAccordionClass } from 'src/pagesComponents/achievements/levelmap/style';

type Props = {
	title: ReactNode;
	initialOpen?: boolean;
	children?: ReactNode;
	isMobile?: boolean;
};

export const LevelAccordion: FC<Props> = ({ title, children, initialOpen = false, isMobile = false }) => {
	const [isOpen, setOpen] = useState<boolean>(initialOpen);

	const { LevelAccordionContent } = getLevelAccordionClass(isMobile);

	return (
		<div
			className={cn(LevelAccordionContent, { 'border-backgroundQuaternary  rounded-xl border border-solid': isOpen })}
			onClick={() => setOpen((prev) => !prev)}
		>
			<div className="flex flex-row items-center justify-between">
				{title}

				<ChevronDown
					className={cn('mr-5', { 'mr-0.5': isMobile }, { ['rotate-180']: isOpen })}
					fill={isOpen ? '#FFFFFF' : ''}
				/>
			</div>
			{isOpen && children}
		</div>
	);
};
