import cn from 'classnames';
import { Caption, Label1 } from 'src/components';
import { colors } from 'src/style';

interface Props {
	onClick: () => void;
	icon: JSX.Element;
	label: string;
	caption: string;
	itemClassName?: string;
}

const wrapperClassName =
	'bg-backgroundSecondary rounded-lg pt-[18px] pr-4 pb-4 pl-4 flex flex-col gap-3 items-start	mx-2 mb-4 w-[242px] cursor-pointer	hover:bg-backgroundSecondaryHover active:bg-backgroundSecondaryActive transition ease-in-out delay-150';

export const QuickActionItem = ({ onClick, icon, label, caption, itemClassName }: Props) => (
	<div className={cn(itemClassName, wrapperClassName)} onClick={onClick} data-testid={`QuickActionItem__${label}`}>
		{icon}
		<div className="flex flex-col items-start">
			<Label1 data-testid={'QuickActionItem__title'}>{label}</Label1>
			<Caption color={colors.foregroundSecondary} data-testid={'QuickActionItem__caption'}>
				{caption}
			</Caption>
		</div>
	</div>
);
