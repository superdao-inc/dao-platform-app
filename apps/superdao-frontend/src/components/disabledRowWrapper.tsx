import styled from '@emotion/styled';
import { colors } from 'src/style/variables';

type Props = { isDisabled: boolean };

export const DisabledRowWrapper = styled.a<Props>`
	display: flex;
	align-items: center;
	padding: 8px 0px;
	border-radius: 8px;
	position: relative;

	&:hover {
		cursor: ${({ isDisabled }) => (isDisabled ? 'pointer' : 'not-allowed')};
		background: ${colors.overlaySecondary};
	}
`;
