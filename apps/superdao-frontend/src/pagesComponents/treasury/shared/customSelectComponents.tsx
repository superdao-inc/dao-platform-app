import { OptionProps, ControlProps, components, StylesConfig } from 'react-select';
import { Cell, CheckIcon, DefaultSelectProps, getDefaultColourStyles, UserAvatar } from 'src/components';
import { SelectProps } from 'src/pagesComponents/treasury/networkSelect';

export const CustomControl = ({ children, ...props }: ControlProps<DefaultSelectProps>) => {
	// @ts-ignore
	const { value }: { value: DefaultSelectProps } = props.selectProps;

	return (
		<components.Control {...props}>
			{value && (
				<div className="mr-2">
					{value.controlIcon ? value.controlIcon : <UserAvatar size="xs" seed={undefined} src={undefined} />}
				</div>
			)}
			{children}
		</components.Control>
	);
};

export const CustomOption = (props: OptionProps<DefaultSelectProps>) => {
	const { data, isSelected, isDisabled, innerRef, innerProps } = props;

	return (
		<Cell
			{...innerProps}
			{...data}
			className="min-h[38px] hover:bg-backgroundTertiaryHover w-full"
			ref={innerRef as any}
			after={isSelected && <CheckIcon />}
			disabled={isDisabled}
			size="md"
			before={data.icon}
		/>
	);
};

export const selectStyles: StylesConfig<SelectProps> = {
	control: (styles, data) => ({
		...styles,
		...getDefaultColourStyles<SelectProps>()?.control?.(styles, data),
		borderRadius: '8px',
		opacity: data.isDisabled ? 0.7 : 1
	}),
	menuList: (styles) => ({
		...styles,
		minHeight: 'auto',
		paddingBottom: 0,
		paddingTop: 0,
		borderRadius: '8px'
	}),
	option: (styles) => ({
		...styles,
		fontSize: '14px !important',
		fontWeight: 'normal'
	}),
	input: (styles) => ({
		...styles,
		color: '#ffff',
		lineHeight: '16px',
		'& > input:focus': {
			'--tw-ring-color': 'transparent'
		}
	})
};
