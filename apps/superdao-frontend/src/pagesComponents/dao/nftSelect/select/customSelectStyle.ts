import { StylesConfig } from 'react-select';

import { SelectNftProps } from '../types';

import { getDefaultColourStyles } from 'src/components';
import { colors } from 'src/style';

export const customDaoSelectColourStyles: StylesConfig<SelectNftProps> = {
	control: (styles, data) => ({
		...styles,
		...getDefaultColourStyles<SelectNftProps>()?.control?.(styles, data),
		padding: '0 16px',
		paddingLeft: '0',
		background: data.menuIsOpen ? colors.backgroundTertiary : colors.backgroundSecondary
	})
};
