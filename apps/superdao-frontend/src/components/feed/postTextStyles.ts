import { css } from '@emotion/react';
import { colors } from 'src/style';
import { MAX_NUM_OF_LINES } from './constants';

export const collapsedTextStyle = css`
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: ${MAX_NUM_OF_LINES};
	line-clamp: ${MAX_NUM_OF_LINES};
	-webkit-box-orient: vertical;
`;

export const toggleStyles = css`
	cursor: pointer;
	user-select: none;

	color: ${colors.accentPrimary};
	margin-top: 4px;
`;
