import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SingleValue } from 'react-select';
import { UNLIMITED_MAX_AMOUNT_VALUE } from 'src/constants';
import { CustomSelect, DefaultSelectProps, Input, Label } from 'src/components';
import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { SelectCustomOption } from './selectCustomOption';
import { NUMBERS_REGEX } from '@sd/superdao-shared';

type Props = {
	tierIdx: number;
	isNewTier: boolean;
};

const SELECT_UNLIMITED_VALUE = 'unlimited';
const SELECT_LIMITED_VALUE = 'limited';

const selectUnlimitedOption = { value: SELECT_UNLIMITED_VALUE, label: 'Unlimited' };
const selectLimitedOption = { value: SELECT_LIMITED_VALUE, label: 'Specify a number' };

const options = [selectUnlimitedOption, selectLimitedOption];

const getSelectValue = (currentValue: number) => {
	if (currentValue === UNLIMITED_MAX_AMOUNT_VALUE) {
		return selectUnlimitedOption;
	}

	return selectLimitedOption;
};

export const MaxAmountSelect = ({ tierIdx, isNewTier }: Props) => {
	const { t } = useTranslation();

	const { register, formState, watch, setValue } = useFormContext<NftAdminUpdateCollectionTxInput>();
	const { errors } = formState;

	const maxAmount = watch(`tiers.${tierIdx}.maxAmount`);

	const [limitationStatus, setLimitationStatus] = useState<DefaultSelectProps>(getSelectValue(maxAmount));
	const isLimited = limitationStatus.value === SELECT_LIMITED_VALUE;

	const handleSelectChange = (selected?: SingleValue<DefaultSelectProps>) => {
		if (!selected) {
			return;
		}

		if (selected.value === SELECT_UNLIMITED_VALUE && isLimited) {
			setValue(`tiers.${tierIdx}.maxAmount`, UNLIMITED_MAX_AMOUNT_VALUE, { shouldValidate: true });
		}

		if (selected.value === SELECT_LIMITED_VALUE && !isLimited) {
			setValue(
				`tiers.${tierIdx}.maxAmount`,
				// The design requires that the field be empty when it appears, but without an error
				// @ts-ignore
				'',
				{ shouldValidate: true }
			);
		}

		setLimitationStatus(selected);
	};

	const isDisabled = !isNewTier;

	return (
		<div className="mb-4">
			<Label>{t('modals.selfServiceTier.fields.amount.label')}</Label>
			<CustomSelect
				isDisabled={isDisabled}
				onChange={({ value: newValue }) => handleSelectChange(newValue)}
				value={limitationStatus}
				options={options}
				components={{ Option: SelectCustomOption }}
			/>

			{isLimited && (
				<div className="mt-2">
					<Input
						errorClassName="static"
						type="number"
						disabled={isDisabled}
						appearance="hide"
						placeholder={t('modals.selfServiceTier.fields.amount.placeholder')}
						data-testid="NftAdminTierModal__maxAmount"
						{...register(`tiers.${tierIdx}.maxAmount`, {
							setValueAs: (value) => (typeof value === 'string' && value === '' ? value : Number(value)),
							pattern: {
								value: NUMBERS_REGEX,
								message: t('modals.selfServiceTier.fields.amount.error')
							},
							max: {
								value: UNLIMITED_MAX_AMOUNT_VALUE,
								message: t('modals.selfServiceTier.fields.amount.errorMax')
							},
							min: {
								value: 1,
								message: t('modals.selfServiceTier.fields.amount.errorEmpty')
							},
							validate: {
								required: (value) => (!!value ? true : t('modals.selfServiceTier.fields.amount.errorEmpty'))
							}
						})}
						error={errors?.tiers?.[tierIdx]?.maxAmount?.message}
					/>
				</div>
			)}
		</div>
	);
};
