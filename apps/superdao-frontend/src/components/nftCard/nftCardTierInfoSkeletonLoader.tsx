import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { colors } from 'src/style';

const animation = keyframes`
	to {
		background-position-x: -200%;
	}
`;

export const NftCardTierInfoSkeletonLoader = styled.div`
	width: 50px;
	height: 12px;
	background: #eee;
	background: linear-gradient(
		110deg,
		${colors.backgroundTertiary} 8%,
		${colors.backgroundQuaternary} 18%,
		${colors.backgroundTertiary} 33%
	);
	border-radius: 8px;
	background-size: 200% 100%;
	animation: 1.5s ${animation} linear infinite;
`;
