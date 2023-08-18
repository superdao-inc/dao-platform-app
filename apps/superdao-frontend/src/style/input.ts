import { css } from '@emotion/react';
import { borders, colors } from 'src/style/variables';

const getInputWrapperHoverStyle = (disabled?: boolean) =>
	disabled
		? css``
		: css`
				&:hover {
					background: ${colors.backgroundSecondaryHover};
				}
		  `;

export const getInputWrapperStyle = ({
	disabled,
	padding,
	gap
}: {
	disabled?: boolean;
	padding?: string | number;
	gap?: string | number;
}) => css`
	display: flex;
	align-items: center;
	gap: ${gap ?? '12px'};
	width: 100%;
	border-radius: ${borders.medium};
	padding: ${padding ?? '8px 16px'};

	background: ${colors.overlaySecondary};

	font-size: 15px;
	line-height: 24px;

	transition: background 100ms;

	${getInputWrapperHoverStyle(disabled)}
`;

export const getInputFileWrapperStyleAppendix = () => css`
	min-height: 40px;
`;
