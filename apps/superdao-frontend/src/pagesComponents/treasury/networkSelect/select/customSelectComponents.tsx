import { ReactNode } from 'react';
import { OptionProps } from 'react-select';

import { SelectProps } from '../types';

import { Cell, CheckIcon } from 'src/components';
import { colors } from 'src/style';

const DefaultOption = (props: OptionProps<SelectProps> & { after?: ReactNode }) => {
	const { data, innerRef, innerProps, after } = props;

	return (
		<Cell
			className="hover:bg-backgroundTertiaryHover rounded"
			ref={innerRef as any}
			{...data}
			{...innerProps}
			key={data.value}
			before={data.icon}
			after={after}
			size="auto"
			disabled={data.isDisabled}
			label={data.labelElement ?? data.label}
		/>
	);
};

export const CheckboxOption = (props: OptionProps<SelectProps>) => {
	const { isSelected } = props;

	return <DefaultOption after={isSelected ? <CheckIcon fill={colors.foregroundSecondary} /> : null} {...props} />;
};
