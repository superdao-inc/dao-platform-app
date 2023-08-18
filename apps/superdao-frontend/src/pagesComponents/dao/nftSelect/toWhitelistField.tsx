import { useTranslation } from 'next-i18next';
import { DetailedHTMLProps, ForwardedRef, forwardRef, HTMLAttributes, useMemo } from 'react';
import styled from '@emotion/styled';
import { DaoCheckboxOption } from './select/customSelectComponents';
import { SelectManualProps, SelectImportProps } from './types';
import { CustomSelect, DefaultSelectProps, MultiChangeProps, StyledSingleValueContainer } from 'src/components';

export const ToWhitelistField = forwardRef(
	(
		props: Omit<SelectManualProps, 'formType'> | Omit<SelectImportProps, 'formType'>,
		ref: ForwardedRef<HTMLDivElement>
	) => {
		const { t } = useTranslation();

		const { options, value, components, onChange, trigger, ...restProps } = props;

		const handleMultiChange = ({ value: values }: MultiChangeProps<DefaultSelectProps>) => {
			onChange?.(values.map((tier) => tier.value));
			trigger?.();
		};

		const selectedValue = useMemo(
			() => options.filter((item) => (value as string | string[])?.includes(item.value)),
			[options, value]
		);

		return (
			<CustomSelect
				innerRef={ref}
				placeholder={t('modals.tierManager.whitelist.tiers.selectAvailable')}
				onMultiChange={handleMultiChange}
				isMulti
				allSelectedPlaceholderComponent={Placeholder}
				components={{ Option: DaoCheckboxOption, ...components }}
				value={selectedValue}
				options={options}
				{...restProps}
			/>
		);
	}
);

ToWhitelistField.displayName = 'ToWhitelistField';

const Placeholder = (props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
	const { t } = useTranslation();

	return (
		<StyledSingleValueContainer {...props}>
			<Text>{t('modals.tierManager.whitelist.tiers.all')}</Text>
		</StyledSingleValueContainer>
	);
};

const Text = styled.span`
	font-size: 15px;
	line-height: 24px;
`;
