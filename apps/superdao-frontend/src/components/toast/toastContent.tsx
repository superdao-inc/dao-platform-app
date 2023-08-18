import React, { FC } from 'react';

import { toast, Toast } from 'react-hot-toast';
import styled from '@emotion/styled';
import { CrossIcon } from 'src/components/assets/icons';
import { colors } from 'src/style';

export type ToastContentProps = {
	hasCloseIcon?: boolean;
	t: Toast;
	children: React.ReactNode;
};

export const ToastContent: FC<ToastContentProps> = (props) => {
	const { hasCloseIcon = false, t, children } = props;

	return (
		<Content>
			{children}
			{hasCloseIcon && t.type !== 'loading' && (
				<IconWrapper onClick={() => toast.remove(t.id)}>
					<CrossIcon />
				</IconWrapper>
			)}
		</Content>
	);
};

const Content = styled.div`
	display: flex;
	align-items: center;
`;

const IconWrapper = styled.div`
	margin-left: 12px;

	width: 30px;
	height: 30px;
	border-radius: 50%;

	cursor: pointer;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}

	display: flex;
	justify-content: center;
	align-items: center;
`;
