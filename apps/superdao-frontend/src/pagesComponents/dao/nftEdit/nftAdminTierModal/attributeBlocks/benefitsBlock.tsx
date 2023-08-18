import { useTranslation } from 'next-i18next';
import { FC, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { css } from '@emotion/react';
import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { AddBoldIcon, Caption, Cell, CrossIcon, Input, Label1 } from 'src/components';
import { colors } from 'src/style';
import { MetadataAttributesSdTraits } from '../../types';

export const BENEFIT_SD_TRAIT = 'sd_benefit';

const getDefaultBenefitAttr = (benefitName: string = '') => ({
	traitType: 'Benefit',
	sdTrait: MetadataAttributesSdTraits.BENEFIT_SD_TRAIT,
	valueString: benefitName
});

type Props = {
	tierIdx: number;
};

export const BenefitsBlock: FC<Props> = ({ tierIdx }) => {
	const { t } = useTranslation();

	const { control, register, watch, setValue } = useFormContext<NftAdminUpdateCollectionTxInput>();

	const benefits = watch(`tiers.${tierIdx}.benefits`);
	const { fields, remove, append } = useFieldArray({
		control,
		name: `tiers.${tierIdx}.benefits`
	});

	useEffect(() => {
		if (benefits.length === 0) {
			setValue(`tiers.${tierIdx}.benefits`, [getDefaultBenefitAttr('')], { shouldTouch: false, shouldDirty: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAddBenefitClick = () => {
		append(getDefaultBenefitAttr(''));
	};

	const handleBenefitRemoveClick = (idx: number) => () => {
		remove(idx);

		if (benefits.length === 1 && idx === 0) {
			handleAddBenefitClick();
		}
	};

	return (
		<div className="w-full">
			<Label1 className="mt-4">{t('pages.editNfts.collection.benefits.title')}</Label1>
			<Caption color={colors.accentPrimary} className="text-foregroundTertiary mb-1">
				{t('pages.editNfts.collection.benefits.info')}
			</Caption>

			{fields.length > 0 && (
				<div className="mb-4 grid gap-2.5">
					{fields.map((attr, idx) => {
						return (
							<div className="flex items-center justify-between" key={attr.id}>
								<Input
									css={inputStyles}
									errorClassName="static"
									placeholder={t('pages.editNfts.collection.benefits.placeholder')}
									{...register(`tiers.${tierIdx}.benefits.${idx}.valueString`)}
								/>
								<div className="mt-2 ml-3.5 flex h-4 w-4 min-w-[16px] items-center justify-center">
									{(fields.length > 1 || benefits[idx].valueString) && (
										<CrossIcon
											width={16}
											height={16}
											className={'cursor-pointer transition-all'}
											fill={colors.foregroundSecondary}
											onClick={handleBenefitRemoveClick(idx)}
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
					onClick={handleAddBenefitClick}
					size="md"
					className="-mx-3 rounded-lg"
					before={
						<div className="bg-overlaySecondary grid h-10 w-10 place-content-center rounded-full">
							<AddBoldIcon fill={colors.foregroundSecondary} width={18} height={18} />
						</div>
					}
					label={t('pages.editNfts.collection.benefits.benefitAddBtn')}
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
