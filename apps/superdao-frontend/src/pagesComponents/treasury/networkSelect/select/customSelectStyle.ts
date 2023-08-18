import { StylesConfig } from 'react-select';

import { SelectProps } from '../types';

import { colors } from 'src/style';
import { selectStyles } from 'src/pagesComponents/treasury/shared/customSelectComponents';

export const customNetworkSelectStyles: StylesConfig<SelectProps> = {
	...selectStyles,
	control: (styles, data) => ({
		...styles,
		padding: '0 14px',
		width: '220px',
		background: data.menuIsOpen ? colors.backgroundTertiary : colors.backgroundSecondary,
		borderColor: colors.backgroundSecondary,
		cursor: 'pointer',
		minHeight: '32px',
		opacity: data.isDisabled ? 0.7 : 1,
		borderRadius: '8px',
		'&:hover': {
			borderColor: colors.backgroundSecondary
		}
	})
};
