import { useTranslation } from 'next-i18next';
import { FC, useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { AddBoldIcon, Cell, CrossIcon, CustomSelect, Input, Label1 } from 'src/components';
import { colors } from 'src/style';
import { tierTypes, TIER_TYPE_ACHIEVEMENT, TIER_TYPE_MEMBERSHIP } from './constants';
import { getDefaultLabelAttr, getDefaultXPAttr, orderAttrs } from './utils';
import { SelectCustomOption } from '../../selectCustomOption';

type Props = {
	tierIdx: number;
};

export const AchievementsBlock: FC<Props> = ({ tierIdx }) => {
	const { t } = useTranslation();

	const {
		control,
		register,
		watch,
		setValue,
		formState: { errors }
	} = useFormContext<NftAdminUpdateCollectionTxInput>();

	const { fields, remove, append, replace } = useFieldArray({
		control,
		name: `tiers.${tierIdx}.achievements`
	});

	const achievements = watch(`tiers.${tierIdx}.achievements`);
	const tierType = watch(`tiers.${tierIdx}.achievements.0.valueString`);
	const isTierTypeAchievement = tierType === TIER_TYPE_ACHIEVEMENT;
	const isTierTypeMembership = tierType === TIER_TYPE_MEMBERSHIP;

	useEffect(() => {
		const sortedAttrs = orderAttrs(achievements);
		setValue(`tiers.${tierIdx}.achievements`, sortedAttrs, { shouldTouch: false, shouldDirty: false });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isTierTypeAchievement && achievements.length < 2) {
			append(getDefaultXPAttr(0));
			append(getDefaultLabelAttr(''));
		} else if (isTierTypeMembership && achievements.length > 1) {
			replace(achievements[0]);
		}
	}, [append, achievements, replace, isTierTypeAchievement, isTierTypeMembership]);

	const handleAddLabelClick = () => {
		append(getDefaultLabelAttr(''));
	};

	const handleLabelRemoveClick = (idx: number) => () => {
		remove(idx);

		if (achievements.length === 3 && idx === 2) {
			handleAddLabelClick();
		}
	};

	if (!fields.length) {
		return null;
	}

	return (
		<div className="w-full">
			<div className="flex items-start gap-4">
				<div className="basis-2/4">
					<Label1 className="mt-4 leading-10">{t('pages.editNfts.collection.achievements.typeTitle')}</Label1>

					<Controller
						name={`tiers.${tierIdx}.achievements.0.valueString`}
						control={control}
						rules={{ required: true }}
						render={({ field: { name, value, onChange, ref } }) => (
							<CustomSelect
								innerRef={ref}
								className="basis-2/4"
								onChange={({ value: newValue }) => onChange(newValue?.value)}
								name={name}
								value={tierTypes.find((item) => item.value === value)}
								options={tierTypes}
								components={{ Option: SelectCustomOption }}
							/>
						)}
					/>
				</div>

				<div className="basis-2/4">
					<Label1 className="mt-4 leading-10">{t('pages.editNfts.collection.achievements.xpTitle')}</Label1>

					{fields[1] ? (
						<Input
							key="real_xp"
							type="number"
							step={1}
							min={0}
							errorClassName="static"
							placeholder="100"
							error={errors?.tiers?.[tierIdx]?.achievements?.[1]?.valueNumber?.message}
							{...register(`tiers.${tierIdx}.achievements.1.valueNumber`, {
								min: {
									value: 0,
									message: 'Must be positive'
								},
								setValueAs(v) {
									if (!v) {
										return 0;
									}
									if (typeof v === 'number') {
										return v;
									}
									if (typeof v === 'string') {
										return parseInt(v, 10);
									}
									return v;
								}
							})}
						/>
					) : (
						<Input key="xp_placeholder" disabled errorClassName="static" placeholder="0" value={0} />
					)}
				</div>
			</div>

			{isTierTypeAchievement && (
				<>
					<Label1 className="mt-4 leading-10">{t('pages.editNfts.collection.achievements.labelsTitle')}</Label1>
					{fields.length > 2 && (
						<div className="mb-4 grid gap-2.5">
							{fields.map((attr, idx) => {
								if (idx < 2) {
									return null;
								}

								return (
									<div className="flex justify-between" key={attr.id}>
										<Input
											key={attr.id}
											errorClassName="static"
											placeholder={t('pages.editNfts.collection.achievements.labelsPlaceholder')}
											{...register(`tiers.${tierIdx}.achievements.${idx}.valueString`)}
										/>
										<div className="my-3 mr-0.5 ml-3.5 flex h-4 w-4 items-center justify-center">
											<CrossIcon
												width={16}
												height={16}
												className={'cursor-pointer transition-all'}
												fill={colors.foregroundSecondary}
												onClick={handleLabelRemoveClick(idx)}
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}

					<div className="w-full">
						<Cell
							disabled={isTierTypeMembership}
							onClick={handleAddLabelClick}
							size="md"
							className="hover:bg-overlaySecondary -mx-3 rounded-lg"
							before={
								<div className="bg-overlaySecondary grid h-10 w-10 place-content-center rounded-full">
									<AddBoldIcon fill={colors.foregroundSecondary} width={18} height={18} />
								</div>
							}
							label={t('pages.editNfts.collection.achievements.labelAddBtn')}
						/>
					</div>
				</>
			)}
		</div>
	);
};
