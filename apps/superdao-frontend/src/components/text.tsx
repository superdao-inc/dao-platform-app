import styled from '@emotion/styled';

import { colors } from 'src/style';

const StyledText = styled.span<{ color?: string }>`
	font-family: sans-serif;
	font-style: normal;
	color: ${(props) => props.color || colors.foregroundPrimary};
	display: block;

	margin: 0;
	padding: 0;
`;

const StyledDisplayFont = styled(StyledText)`
	font-family: 'SF Pro Display', sans-serif;
`;

const StyledTextFont = styled(StyledText)`
	font-family: 'SF Pro Text', sans-serif;
`;

export const Title1 = styled(StyledDisplayFont)`
	font-size: 24px;
	line-height: 32px;
	font-weight: 700;
`;

export const Title2 = styled(StyledDisplayFont)`
	font-size: 20px;
	line-height: 28px;
	font-weight: 700;
`;

export const Title3 = styled(StyledTextFont)`
	font-size: 17px;
	line-height: 24px;
	font-weight: 700;
`;

export const Title4 = styled(StyledTextFont)`
	font-size: 15px;
	line-height: 24px;
	font-weight: 700;
`;

export const Label1 = styled(StyledTextFont)`
	font-size: 15px;
	line-height: 24px;
	font-weight: 600;
`;

export const Label2 = styled(StyledTextFont)`
	font-size: 14px;
	line-height: 20px;
	font-weight: 600;
`;

export const Label3 = styled(StyledTextFont)`
	font-size: 13px;
	line-height: 18px;
	font-weight: 600;
`;

export const Article1 = styled(StyledTextFont)`
	font-size: 36px;
	line-height: 48px;
	font-weight: 700;
`;

export const Article2 = styled(StyledTextFont)`
	font-size: 28px;
	line-height: 40px;
	font-weight: 700;
`;

export const Body = styled(StyledTextFont)`
	font-size: 15px;
	line-height: 24px;
	font-weight: 400;
`;

export const SubHeading = styled(StyledTextFont)`
	font-size: 14px;
	line-height: 20px;
	font-weight: 400;
`;

export const Headline = styled(StyledTextFont)`
	font-weight: 600;
	font-size: 15px;
	line-height: 21px;
`;

export const Caption = styled(StyledTextFont)`
	font-size: 13px;
	line-height: 18px;
	font-weight: 400;
`;

export const Detail = styled(StyledTextFont)`
	font-size: 10px;
	line-height: 12px;
	font-weight: 700;
`;

export const Ellipsis = styled.div<{ shouldNotWidth?: boolean }>`
	white-space: nowrap;
	width: ${(props) => !props.shouldNotWidth && '100%'};
	overflow: hidden;
	text-overflow: ellipsis;
`;
