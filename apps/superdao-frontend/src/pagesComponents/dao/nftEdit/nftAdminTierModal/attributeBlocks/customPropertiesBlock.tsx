import { useTranslation } from 'next-i18next';
import { FC, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { css } from '@emotion/react';
import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { AddBoldIcon, Caption, Cell, CrossIcon, Input, Label1 } from 'src/components';
import { colors } from 'src/style';

const getDefaultPropertyAttr = (traitType: string = '', propertyName: string = '') => ({
	traitType,
	valueString: propertyName
});

type Props = {
	tierIdx: number;
};

export const CustomPropertiesBlock: FC<Props> = ({ tierIdx }) => {
	const { t } = useTranslation();

	const {
		control,
		register,
		watch,
		setValue,
		trigger,
		formState: { errors }
	} = useFormContext<NftAdminUpdateCollectionTxInput>();

	const customProperties = watch(`tiers.${tierIdx}.customProperties`);
	const { fields, remove, append } = useFieldArray({
		control,
		name: `tiers.${tierIdx}.customProperties`
	});

	useEffect(() => {
		if (customProperties.length === 0) {
			setValue(`tiers.${tierIdx}.customProperties`, [getDefaultPropertyAttr('')], {
				shouldTouch: false,
				shouldDirty: false
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAddPropertyClick = () => {
		append(getDefaultPropertyAttr(''));
	};

	const handlePropertyRemoveClick = (idx: number) => () => {
		remove(idx);

		if (customProperties.length === 1 && idx === 0) {
			handleAddPropertyClick();
		}
	};

	return (
		<div className="w-full">
			<Label1 className="mt-4">{t('pages.editNfts.collection.properties.title')}</Label1>
			<Caption color={colors.accentPrimary} className="text-foregroundTertiary mb-1">
				{t('pages.editNfts.collection.properties.info')}
			</Caption>

			{fields.length > 0 && (
				<div className="mb-4 grid gap-2.5">
					{fields.map((attr, idx) => {
						return (
							<div key={attr.id} className="flex items-center justify-between">
								<div key={attr.id} className="grid flex-grow grid-cols-2 gap-4">
									<Input
										css={inputStyles}
										errorClassName="static"
										placeholder={t('pages.editNfts.collection.properties.keyPlaceholder')}
										{...register(`tiers.${tierIdx}.customProperties.${idx}.traitType`, {
											validate: (v) => {
												if (customProperties[idx].valueString && (!v || (typeof v === 'string' && !v.trim()))) {
													return 'Set label';
												}
											}
										})}
										error={errors.tiers?.[tierIdx]?.customProperties?.[idx]?.traitType?.message}
									/>
									<Input
										css={inputStyles}
										errorClassName="static"
										placeholder={t('pages.editNfts.collection.properties.valuePlaceholder')}
										{...register(`tiers.${tierIdx}.customProperties.${idx}.valueString`, {
											onChange: () => trigger(`tiers.${tierIdx}.customProperties.${idx}.traitType`)
										})}
									/>
								</div>
								<div className="mt-2 ml-3.5 flex h-4 w-4 min-w-[16px] items-center justify-center">
									{(fields.length > 1 || customProperties[idx].valueString) && (
										<CrossIcon
											width={16}
											height={16}
											className={'cursor-pointer transition-all'}
											fill={colors.foregroundSecondary}
											onClick={handlePropertyRemoveClick(idx)}
										/>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			<div className="w-full">
				<Cell
					onClick={handleAddPropertyClick}
					size="md"
					className="-mx-3 rounded-lg"
					before={
						<div className="bg-overlaySecondary grid h-10 w-10 place-content-center rounded-full">
							<AddBoldIcon fill={colors.foregroundSecondary} width={18} height={18} />
						</div>
					}
					label={t('pages.editNfts.collection.properties.propertyAddBtn')}
				/>
			</div>
		</div>
	);
};

const inputStyles = css`
	::placeholder {
		color: ${colors.foregroundTertiary};
	}
`;
