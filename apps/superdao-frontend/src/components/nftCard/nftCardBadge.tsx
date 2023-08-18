import styled from '@emotion/styled';
import { Detail } from 'src/components/text';
import { colors } from 'src/style';

type NftCardBadgeProps = {
	text: string;
	color?: string;
};

export const NftCardBadge = (props: NftCardBadgeProps) => {
	const { text, color } = props;

	return (
		<BadgeWrapper backgroundColor={color}>
			<StyledDetail className="uppercase">{text}</StyledDetail>
		</BadgeWrapper>
	);
};

const BadgeWrapper = styled.div<{ backgroundColor?: string }>`
	position: absolute;
	top: 24px;
	left: 24px;

	display: flex;
	align-items: center;
	justify-content: center;

	padding: 4px 6px;
	border-radius: 100px;

	background-color: ${({ backgroundColor }) => backgroundColor || colors.tintCyan};

	z-index: 4;
`;

const StyledDetail = styled(Detail)`
	letter-spacing: 0.25px;
	text-transform: uppercase;
`;
