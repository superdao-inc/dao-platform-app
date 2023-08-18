import cn from 'classnames';
import { OptionProps } from 'react-select';
import { CheckIcon, DefaultSelectProps, Label1, SubHeading } from 'src/components';
import { colors } from 'src/style';

export const SelectCustomOption = (props: OptionProps<DefaultSelectProps>) => {
	const { data, isSelected, isDisabled, innerRef, innerProps } = props;

	return (
		<div
			className={cn(
				'hover:bg-backgroundTertiaryHover flex min-h-[40px] w-full cursor-pointer items-center gap-4 py-2 px-4',
				isDisabled && 'hover:bg-backgroundTertiary	cursor-not-allowed'
			)}
			ref={innerRef as any}
			{...innerProps}
		>
			{data.icon}
			<div className="flex flex-col">
				<Label1>{data.label}</Label1>
				<SubHeading color={colors.foregroundTertiary}>{data.description}</SubHeading>
			</div>

			{isSelected && <CheckIcon className="ml-auto" fill={colors.accentPositive} />}
		</div>
	);
};
