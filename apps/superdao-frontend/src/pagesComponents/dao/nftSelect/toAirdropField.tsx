import { useTranslation } from 'next-i18next';
import { ForwardedRef, forwardRef } from 'react';

import { DaoRadioOption } from './select/customSelectComponents';
import { SelectManualProps, SelectImportProps, SelectNftProps } from './types';

import { CustomSelect } from 'src/components';

export const ToAirdropField = forwardRef(
	(
		props: Omit<SelectManualProps, 'formType'> | Omit<SelectImportProps, 'formType'>,
		ref: ForwardedRef<HTMLDivElement>
	) => {
		const { t } = useTranslation();

		const { options, value, components, maxMenuHeight, onChange, trigger, ...restProps } = props;

		const handleChange = (tier: SelectNftProps | null) => {
			onChange([tier?.value || '']);
			trigger && trigger();
		};

		return (
			<CustomSelect
				innerRef={ref}
				placeholder={t('pages.dao.addMembersManually.actions.select')}
				onChange={({ value: tier }) => {
					handleChange(tier);
				}}
				components={{ Option: DaoRadioOption, ...components }}
				value={options.find((item) => item.value === value)}
				options={options}
				maxMenuHeight={maxMenuHeight}
				{...restProps}
			/>
		);
	}
);

ToAirdropField.displayName = 'ToAirdropField';
