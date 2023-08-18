import styled from '@emotion/styled';

import { Cell, SubHeading } from 'src/components';
import { colors } from 'src/style';

export const getIsEnoughMoney = (
	userBalance: number,
	price: number,
	gas: number,
	userBalanceInNativeToken: number,
	isMatic: boolean
) => {
	if (isMatic) {
		return userBalanceInNativeToken > price + gas;
	}

	const isEnoughMoneyInToken = userBalance >= price;
	const isEnoughMoneyForGas = userBalanceInNativeToken >= gas;

	return isEnoughMoneyInToken && isEnoughMoneyForGas;
};

type TokenDescriptionProps = {
	balance: number;
	isEnough: boolean;
};

export const TokenDescription = (props: TokenDescriptionProps) => {
	const { balance, isEnough } = props;
	const color = isEnough ? 'text-tintGreen' : 'text-foregroundSecondary';

	return <SubHeading className={color}>{`Balance: ${balance}`}</SubHeading>;
};

export const CurrencyCellView = styled(Cell)<{ isSelected: boolean; isDisabled: boolean }>`
	border-radius: 8px;
	transition: 0.2s;
	margin-bottom: 4px;
	padding: 4px 0;

	background: ${({ isSelected }) => (isSelected ? colors.overlayTertiary : colors.backgroundSecondary)};
	${({ isDisabled }) => isDisabled && `cursor: not-allowed;`}

	&:hover {
		background: ${({ isSelected }) => (isSelected ? colors.overlayTertiary : colors.overlaySecondary)};
	}

	&:active {
		background: ${colors.overlayQuinary};
	}

	&:last-of-type {
		margin-bottom: unset;
	}
`;
