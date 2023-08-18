import React, { MouseEventHandler, ReactNode, useMemo } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Button } from 'src/components/button';
import { Label2 } from 'src/components/text';
import { colors } from 'src/style';
import Tooltip from 'src/components/tooltip';

type NftCardButtonProps = {
	content: string;
	onClick?: (event: React.MouseEvent) => void;
	isDisabled?: boolean;
	className?: string;
	/**
	 * Tooltip to show on btn hover.
	 */
	btnTooltipContent?: ReactNode;
};

export const NftCardButton = (props: NftCardButtonProps) => {
	const { onClick, content, isDisabled = false, btnTooltipContent, className = '' } = props;

	const buttonColor = useMemo(() => {
		if (isDisabled) return 'overlaySecondary';
		return 'accentPrimary';
	}, [isDisabled]);

	const handleButtonClick: MouseEventHandler = (event) => {
		onClick?.(event);
	};

	const buttonElement = (
		<Button className={className} onClick={handleButtonClick} disabled={isDisabled} color={buttonColor} size="md">
			<StyledLabel isDisabled={isDisabled}>{content}</StyledLabel>
		</Button>
	);

	if (btnTooltipContent) {
		return (
			<Tooltip content={btnTooltipContent} placement="top">
				{buttonElement}
			</Tooltip>
		);
	}

	return buttonElement;
};

const StyledLabel = styled(Label2)<{ isDisabled: boolean }>`
	color: ${colors.foregroundPrimary};

	${({ isDisabled }) =>
		isDisabled &&
		css`
			opacity: 0.6;
		`}
`;
