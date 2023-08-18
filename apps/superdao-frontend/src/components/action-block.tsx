import { MouseEvent, HTMLAttributes, ReactNode } from 'react';
import styled from '@emotion/styled';

import { CrossIcon } from 'src/components/assets/icons';
import { colors, borders } from 'src/style';
import { Body, Label1 } from 'src/components/text';

type Props = HTMLAttributes<HTMLDivElement> & {
	title: ReactNode;
	subtitle?: ReactNode;
	action?: ReactNode;
	icon?: ReactNode;
	iconWithoutBackground?: boolean;
	isOpen?: boolean;
	onClose?: (e: MouseEvent) => void;
};

export const ActionBlock = (props: Props) => {
	const { title, subtitle, action, icon, isOpen = true, iconWithoutBackground = false, onClose, ...rest } = props;

	if (!isOpen) return null;

	return (
		<ActionCard {...rest}>
			<Left>
				{icon && <ImgWrap iconWithoutBackground={iconWithoutBackground}>{icon}</ImgWrap>}
				<Text>
					<Label1 color={colors.foregroundPrimary}>{title}</Label1>
					{subtitle && <Body color={colors.foregroundSecondary}>{subtitle}</Body>}
				</Text>
			</Left>
			<Right>
				{action}
				{onClose && <CrossIcon onClick={onClose} />}
			</Right>
		</ActionCard>
	);
};

const ActionCard = styled.div`
	padding: 16px 24px;
	border-radius: ${borders.medium};
	background: ${colors.backgroundSecondary};
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
`;

const Left = styled.div`
	display: flex;
	align-items: center;
`;

const ImgWrap = styled.div<{ iconWithoutBackground: boolean }>`
	border-radius: 50%;
	background: ${({ iconWithoutBackground }) => (iconWithoutBackground ? 'none' : colors.backgroundTertiary)};
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 16px;
`;

const Text = styled.div`
	display: flex;
	flex-direction: column;
	margin-right: 16px;
`;

const Right = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;

	& > svg {
		cursor: pointer;
	}
`;
