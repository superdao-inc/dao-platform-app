import { StylesConfig } from 'react-select';

import { getDefaultColourStyles } from 'src/components';
import { colors } from 'src/style';
import { SelectProps } from 'src/pagesComponents/treasury/networkSelect';

export const modalStyles = {
	content: {
		width: '560px',
		minWidth: '560px'
	}
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
		paddingBottom: '8px',
		paddingTop: '8px',
		borderRadius: '8px',
		position: 'fixed',
		width: '512px',
		background: colors.backgroundTertiary,
		boxShadow: '0px 8px 48px rgba(0, 0, 0, 0.16), 0px 0px 96px rgba(0, 0, 0, 0.08)'
	}),
	option: (styles) => ({
		...styles,
		fontSize: '14px !important',
		fontWeight: 'normal'
	})
};

export const walletSelectStyles = {
	...selectStyles,
	//@ts-ignore
	control: (styles, data) => ({
		...styles,
		...getDefaultColourStyles<SelectProps>()?.control?.(styles, data),
		height: '64px'
	}),
	//@ts-ignore
	menuList: (styles) => ({
		...styles,
		minHeight: 'auto',
		borderRadius: '8px',
		position: 'fixed',
		width: '512px',
		background: colors.backgroundTertiary,
		boxShadow: '0px 8px 48px rgba(0, 0, 0, 0.16), 0px 0px 96px rgba(0, 0, 0, 0.08)',
		maxHeight: '204px'
	})
};

export const nftSelectStyles = {
	...selectStyles,
	//@ts-ignore
	control: (styles, data) => ({
		...styles,
		...getDefaultColourStyles<SelectProps>()?.control?.(styles, data),
		height: '72px',
		opacity: data.isDisabled ? 0.7 : 1
	})
};

export const assetSelectStyles = {
	...selectStyles,
	//@ts-ignore
	menuList: (styles) => ({
		...styles,
		maxHeight: '130px',
		minHeight: 'auto',
		paddingBottom: '8px',
		paddingTop: '8px',
		borderRadius: '8px',
		position: 'fixed',
		width: '248px',
		background: colors.backgroundTertiary,
		boxShadow: '0px 8px 48px rgba(0, 0, 0, 0.16), 0px 0px 96px rgba(0, 0, 0, 0.08)'
	})
};
