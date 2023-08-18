import styled from '@emotion/styled';
import { colors } from 'src/style';

import { Body } from 'src/components';
import { ProposalStatus } from 'src/types/types.generated';

export const DotSeparator = styled.div`
	width: 3px;
	height: 3px;
	border-radius: 50%;
	background: ${colors.foregroundSecondary};
`;

export const FlexBody = styled(Body)`
	max-width: 70%;
	display: inline-block;
`;

export const HintBody = styled(Body)`
	margin-left: -4px;
	color: ${colors.foregroundTertiary};
`;

export const Dot = styled.div<{ state: string | undefined }>`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: ${({ state }) => {
		switch (state) {
			case ProposalStatus.Active:
				return colors.accentPositive;

			case ProposalStatus.Closed:
				return colors.tintPurple;

			default:
				return colors.tintGrey;
		}
	}};
`;

export const StyledProposalContent = styled(Body)`
	position: relative;
	word-break: break-all;
	margin-bottom: 12px;
	width: 100%;
	color: ${colors.foregroundTertiary};

	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
`;

export const Wrapper = styled.div`
	width: 100%;
	margin-bottom: 16px;
	padding: 20px;
	background: ${colors.backgroundSecondary};
	border-radius: 8px;
	cursor: pointer;
	transition: 0.2s;

	&:last-of-type {
		margin-bottom: unset;
	}

	& .onSnapshot {
		transition: 0.2s;
	}

	&:hover {
		background: ${colors.backgroundTertiaryActive};
		transition: 0.2s;

		& .onSnapshot {
			color: ${colors.accentPrimary};
			transition: 0.2s;
		}
	}
`;
