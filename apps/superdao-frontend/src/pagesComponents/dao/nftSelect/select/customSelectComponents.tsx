import { ReactNode, useMemo, FC } from 'react';
import { MultiValueProps, OptionProps, PlaceholderProps, SingleValueProps } from 'react-select';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useTranslation } from 'next-i18next';

import { SelectNftProps } from '../types';

import { WhitelistAddIcon, WhitelistNotAddIcon } from 'src/components/assets/icons';
import {
	Label1,
	SubHeading,
	Cell,
	RadioCheckedIcon,
	CheckboxCheckedIcon,
	StyledSingleValueContainer
} from 'src/components';
import { colors } from 'src/style';

const DefaultOption = (props: OptionProps<SelectNftProps> & { after?: ReactNode }) => {
	const { data, innerRef, innerProps, after } = props;

	return (
		<HoveredStyledCell
			ref={innerRef as any}
			{...data}
			{...innerProps}
			key={data.value}
			before={data.icon}
			after={after}
			size="md"
			disabled={data.isDisabled}
			label={data.labelElement ?? data.label}
		/>
	);
};

export const DaoRadioOption = (props: OptionProps<SelectNftProps>) => {
	const { isSelected } = props;

	return (
		<DefaultOption
			after={
				isSelected ? (
					<RadioCheckedIcon />
				) : (
					<RadioUncheckedWrapper>
						<RadioUnchecked />
					</RadioUncheckedWrapper>
				)
			}
			{...props}
		/>
	);
};

export const DaoCheckboxOption = (props: OptionProps<SelectNftProps>) => {
	const { isSelected } = props;

	return (
		<DefaultOption
			after={
				isSelected ? (
					<CheckboxCheckedIcon />
				) : (
					<CheckboxUncheckedWrapper>
						<CheckboxUnchecked />
					</CheckboxUncheckedWrapper>
				)
			}
			{...props}
		/>
	);
};

export const DaoSingleValue = (props: SingleValueProps<SelectNftProps>) => {
	const { data } = props;

	return (
		<SingleValueContainer className="flex items-center justify-start">
			{data?.icon}
			<StyledCell size="md" {...data} />
		</SingleValueContainer>
	);
};

/**
 * @returns return component container for selected option. If value is empty return default placeholder component
 */
export const AirdropDaoSingleValue = (isError: boolean) => {
	const { t } = useTranslation();

	return (props: SingleValueProps<SelectNftProps>) => {
		const { data } = props;

		if (data.value) {
			return (
				<SingleValueContainer>
					<StyledTierCard withError={isError}>
						{data.icon}
						<TierCardContent>
							<StyledLabel1 notAccent={false}>{data?.labelElement ?? data.label}</StyledLabel1>
							<StyledSubHeading>{data.description}</StyledSubHeading>
						</TierCardContent>
					</StyledTierCard>
				</SingleValueContainer>
			);
		}

		return <DaoPlaceholder description={t('modals.tierManager.airdrop.action.notSendNft')} />;
	};
};

type DaoMultiPlaceholderProp = {
	icon: ReactNode;
	title: string;
	description: string;
	accent?: boolean;
};

const DaoMultiValuesPlaceholder = ({ icon, title, description, accent = false }: DaoMultiPlaceholderProp) => (
	<StyledTierCard>
		<StyledMemberIconWrapper>{icon}</StyledMemberIconWrapper>

		<TierCardContent>
			<StyledLabel1 notAccent={!accent}>{title}</StyledLabel1>
			<StyledSubHeading>{description}</StyledSubHeading>
		</TierCardContent>
	</StyledTierCard>
);

export const DaoMultiValue = (props: MultiValueProps<SelectNftProps>) => {
	const { t } = useTranslation();
	const { innerProps, index, selectProps, options } = props;
	const isAll = Array.isArray(selectProps?.value) && selectProps?.value?.length === options?.length;
	const allOptionLabels = useMemo(
		() => (Array.isArray(selectProps?.value) ? selectProps?.value?.map((option) => option.label) : []),
		[selectProps?.value]
	);

	if (index === 0) {
		return (
			<StyledSingleValueContainer {...innerProps}>
				<DaoMultiValuesPlaceholder
					accent
					icon={<WhitelistAddIcon width={22} height={22} />}
					title={isAll ? t('modals.tierManager.whitelist.tiers.all') : allOptionLabels?.join(', ')}
					description={t('modals.tierManager.whitelist.action.sendNft')}
				/>
			</StyledSingleValueContainer>
		);
	}

	return null;
};

const DaoPlaceholder = ({ description }: { description: string }) => {
	const { t } = useTranslation();

	return (
		<StyledSingleValueContainer>
			<DaoMultiValuesPlaceholder
				icon={<WhitelistNotAddIcon width={22} height={22} />}
				title={t('pages.importMembers.notAssigned')}
				description={description}
			/>
		</StyledSingleValueContainer>
	);
};

export const DaoSinglePlaceholder = (_: PlaceholderProps<SelectNftProps>) => {
	const { t } = useTranslation();

	return <DaoPlaceholder description={t('modals.tierManager.airdrop.action.notSendNft')} />;
};

export const DaoMultiPlaceholder = (_: PlaceholderProps<SelectNftProps>) => {
	const { t } = useTranslation();

	return <DaoPlaceholder description={t('modals.tierManager.whitelist.action.notSendNft')} />;
};

const StyledSubHeading = styled(SubHeading)`
	color: ${colors.foregroundSecondary};
`;

const TierCardContent = styled.div`
	flex: 1;
`;

export const StyledMemberIconWrapper = styled.div`
	display: inline-flex;
	padding: 8px;
	background-color: ${colors.overlayTertiary};
	border-radius: 50%;
`;

const TierCard = styled.div`
	display: flex;
	align-items: center;
	border-radius: 8px;
	padding: 14px 20px;
`;

const StyledTierCard = styled(TierCard)<{ withError?: boolean }>`
	gap: 16px;

	color: ${({ withError }) => (withError ? colors.accentNegative : colors.foregroundPrimary)};
	& * {
		color: ${({ withError }) => (withError ? colors.accentNegative : colors.foregroundPrimary)};
	}
`;

type StyledLabelProps = {
	notAccent: boolean;
	children: ReactNode;
};

const StyledLabel1: FC<StyledLabelProps> = ({ children, notAccent = false }) => (
	<Label1
		className="truncate"
		css={styledLabelCss}
		color={notAccent ? colors.foregroundSecondary : colors.foregroundPrimary}
	>
		{children}
	</Label1>
);

const styledLabelCss = css`
	max-width: 120px;
`;

export const CheckboxUnchecked = styled.div`
	width: 20px;
	height: 20px;
	border-radius: 4px;
	border: 1px solid ${colors.overlayQuinary};
`;

export const RadioUnchecked = styled(CheckboxUnchecked)`
	width: 22px;
	height: 22px;
	border-radius: 50%;
`;

export const RadioUncheckedWrapper = styled.div`
	border: 1px solid transparent;
`;

export const CheckboxUncheckedWrapper = styled.div`
	border: 2px solid transparent;
`;

const StyledCell = styled(Cell)`
	width: 100%;
	min-height: 40px;
`;

const SingleValueContainer = styled.div`
	grid-area: 1/1/2/3;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	box-sizing: border-box;
	margin: 0;
	min-height: 0;
	display: flex;
`;

const HoveredStyledCell = styled(StyledCell)`
	&:hover {
		background: ${colors.backgroundTertiaryHover};
	}
`;
