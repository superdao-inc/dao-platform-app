import cn from 'classnames';
import { Detail } from 'src/components';

export const Badge = ({
	title,
	isColored = false,
	detailClass
}: {
	title: string;
	isColored?: boolean;
	detailClass?: string;
}) => {
	return (
		<Detail
			className={cn(
				`flex w-auto flex-row items-center justify-center rounded-[50px]`,
				isColored ? 'bg-tintPurple' : 'bg-backgroundTertiary text-foregroundTertiary',
				detailClass
			)}
		>
			{title.toUpperCase()}
		</Detail>
	);
};
