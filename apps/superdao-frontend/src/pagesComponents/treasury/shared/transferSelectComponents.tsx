import { ReactElement } from 'react';
import { ControlProps, components, ValueContainerProps, OptionProps, GroupHeadingProps } from 'react-select';

import cn from 'classnames';
import { DefaultSelectProps } from 'src/components/customSelect';
import { CheckIcon } from 'src/components';
import { Caption, Ellipsis, Label1, SubHeading } from 'src/components/text';
import { colors } from 'src/style';

export const SelectPlaceholder = (props: { icon: ReactElement; label: string }) => {
	return (
		<div className="flex items-center gap-4">
			{props.icon}
			<Label1>{props.label}</Label1>
		</div>
	);
};

export const GroupHeading = (props: GroupHeadingProps<DefaultSelectProps>) => (
	<div className="mt-[-8px] mb-2 pl-4">
		<Label1>{props.data.label}</Label1>
		{/* @ts-ignore */}
		<Caption color={colors.foregroundTertiary}>{props.data.description}</Caption>
	</div>
);

export const CustomOption = (props: OptionProps<DefaultSelectProps>) => {
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

export const ValueContainer = ({ children, ...props }: ValueContainerProps<DefaultSelectProps>) => {
	// @ts-ignore
	const { value }: { value: DefaultSelectProps } = props.selectProps;

	return (
		<components.ValueContainer {...props}>
			{value && (
				<SubHeading color={colors.foregroundTertiary}>
					<Ellipsis>{value.description}</Ellipsis>
				</SubHeading>
			)}
			{children}
		</components.ValueContainer>
	);
};

export const CustomControl = ({ children, ...props }: ControlProps<DefaultSelectProps>) => {
	// @ts-ignore
	const { value }: { value: DefaultSelectProps } = props.selectProps;

	return (
		<components.Control {...props}>
			{value && <div className="mr-3">{value.controlIcon && value.controlIcon}</div>}
			{children}
		</components.Control>
	);
};
