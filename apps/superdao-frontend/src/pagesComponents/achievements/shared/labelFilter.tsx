import cn from 'classnames';
import { Button } from 'src/components';

type FilterItemProps = {
	label: string;
	count: number | null | undefined;
	activeValue?: string;
	isActive: boolean;
	onClick: () => void;
};

export const FilterItem = ({ label, count, isActive, onClick, activeValue }: FilterItemProps) => {
	const btnLabel = (
		<>
			{label}
			<span className={cn(isActive ? 'text-[#fff]' : 'text-foregroundTertiary', 'pl-1')}>{count}</span>
		</>
	);
	const isAllActive = isActive && Boolean(!activeValue);

	const borderColor = isActive && !isAllActive ? 'border-accentPrimary' : 'border-transparent';
	return (
		<Button
			className={cn(
				'whitespace-nowrap rounded-full border-2 border-solid py-1 capitalize',
				isActive && !isAllActive && 'bg-accentPrimary/30 active:bg-accentPrimary/30',
				borderColor
			)}
			key={label}
			color={isAllActive || isActive ? 'accentPrimary' : 'overlayTertiary'}
			size="md"
			onClick={onClick}
			label={btnLabel}
		/>
	);
};
