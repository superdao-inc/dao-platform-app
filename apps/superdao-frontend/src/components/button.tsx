import React, { ButtonHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { Loader } from './common/loader';
import { colors, borders } from 'src/style';
import { Label1, Label2 } from 'src/components/text';
import { Extends } from 'src/utils/types';

type Size = 'md' | 'lg';
type ButtonColor =
	| 'accentPrimary'
	| 'accentNegative'
	| 'backgroundTertiary'
	| 'backgroundSecondary'
	| 'backgroundQuaternary'
	| 'overlaySecondary'
	| 'overlayTertiary'
	| 'tintBlue'
	| 'twitter'
	| 'polygonScan'
	| 'foregroundTertiary';
type Color = Extends<keyof typeof colors, ButtonColor> | 'transparent';

type ButtonLabelProps = {
	color: Color;
	size: Size;
	label?: React.ReactNode;
	isLoading?: boolean;
	disabled?: boolean;
};

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> &
	ButtonLabelProps & {
		leftIcon?: React.ReactElement;
		rightIcon?: React.ReactElement;
	};

const buttonSizes: Record<Size, string> = {
	md: `
		min-width: 32px;
		min-height: 32px;
	`,
	lg: `
		min-width: 40px;
		min-height: 40px;
	`
};

const ButtonLabel: React.FC<ButtonLabelProps> = ({ label, size, color, isLoading, disabled }) => {
	const LabelElement = size === 'lg' ? Label1 : Label2;

	const loaderColor = color.includes('accentPrimary') || color.includes('accentNegative') ? 'light' : 'dark';
	const isDisabledLabel = !!disabled && !isLoading;

	return (
		<div className="relative">
			{label && (
				<Label as={LabelElement} isVisible={!isLoading} isDisabled={isDisabledLabel}>
					{label}
				</Label>
			)}
			{isLoading && (
				<div style={{ transform: 'translate(-50%, -50%)' }} className="absolute left-1/2 top-1/2">
					<Loader size={size} color={loaderColor} />
				</div>
			)}
		</div>
	);
};

export const Button: React.FC<ButtonProps> = (props) => {
	const { size, color, label, leftIcon, rightIcon, isLoading, disabled, children, ...rest } = props;

	return (
		<ButtonElement size={size} color={color} disabled={disabled} {...rest}>
			{leftIcon && (
				<Icon position="left" size={size}>
					{leftIcon}
				</Icon>
			)}
			{children}
			{label && <ButtonLabel label={label} size={size} color={color} isLoading={isLoading} disabled={disabled} />}
			{rightIcon && (
				<Icon position="right" size={size}>
					{rightIcon}
				</Icon>
			)}
		</ButtonElement>
	);
};

type IconButtonProps = Omit<ButtonProps, 'label' | 'leftIcon' | 'rightIcon'> & {
	icon: React.ReactElement;
	isSymmetric?: boolean;
};

export const IconButton: React.FC<IconButtonProps> = (props) => {
	const { size, color, icon, isLoading, isSymmetric, ...rest } = props;

	return (
		<IconButtonElement size={size} color={color} isSymmetric={isSymmetric} {...rest}>
			{icon}
		</IconButtonElement>
	);
};

const Label = styled.div<{ isVisible: boolean; isDisabled: boolean }>`
	${({ isVisible }) => `opacity: ${isVisible ? 1 : 0};`}
	${({ isDisabled }) => isDisabled && `opacity: 0.6;`}
`;

const ButtonElement = styled.button<{ color: Color; size: Size; isSymmetric?: boolean }>`
	border: none;
	outline: none;
	cursor: pointer;

	display: flex;
	align-items: center;
	justify-content: space-around;
	gap: 16px;

	border-radius: ${borders.medium};
	padding: ${(props) => (props.size === 'lg' ? '8px 24px' : '6px 16px')};
	transition: background-color 150ms ease-in-out;

	${(props) => {
		const { color } = props;

		if (color === 'transparent') {
			return css`
				background-color: transparent;
			`;
		}

		return css`
			background-color: ${colors[color]};
			&:hover {
				background-color: ${colors[`${color}Hover`]};
			}
			&:active {
				background-color: ${colors[`${color}Active`]};
			}
		`;
	}}

	&:disabled {
		cursor: not-allowed;
	}
`;

const IconButtonElement = styled(ButtonElement)`
	${(props) => props.isSymmetric && buttonSizes[props.size]};
	padding: ${(props) => (props.size === 'lg' ? '8px 8px' : '6px 6px')};
`;

const Icon = styled.div<{ size: Size; position: string }>`
	display: flex;
	align-items: center;
	justify-content: center;

	margin: ${(props) =>
		(props.size === 'lg' || props.size === 'md') && (props.position === 'right' ? '2px 0 2px -8px' : '2px -8px 2px 0')};
`;
