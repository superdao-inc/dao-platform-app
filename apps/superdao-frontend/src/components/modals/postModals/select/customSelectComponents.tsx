import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { OptionProps, SingleValueProps } from 'react-select';
import { CheckIcon } from 'src/components/assets/icons';
import { Cell } from 'src/components/cell';
import { DefaultSelectProps, StyledSingleValueContainer } from 'src/components/customSelect';
import { SubHeading } from 'src/components/text';
import { colors } from 'src/style';

export const CustomSingleValue = (hasError: boolean) => {
	return (props: SingleValueProps<DefaultSelectProps>) => {
		const { data, innerProps } = props;

		return (
			<StyledSingleValueContainer css={cssContainer} {...innerProps}>
				{data.icon}
				<Label color={hasError ? colors.accentNegative : colors.foregroundPrimary}>{data.label}</Label>
			</StyledSingleValueContainer>
		);
	};
};

export const CustomOption = (props: OptionProps<DefaultSelectProps>) => {
	const { data, isSelected, isDisabled, innerRef, innerProps } = props;

	return (
		<StyledCell
			{...innerProps}
			{...data}
			ref={innerRef as any}
			after={isSelected && <CheckIcon />}
			disabled={isDisabled}
			size="md"
			before={data.icon}
		/>
	);
};

const Label = styled(SubHeading)`
	padding-right: 12px;
	line-height: 22px;
`;

const cssContainer = css`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 12px;
`;

const StyledCell = styled(Cell)`
	width: 100%;
	min-height: 40px;

	&:hover {
		background: ${colors.backgroundTertiaryHover};
	}
`;
