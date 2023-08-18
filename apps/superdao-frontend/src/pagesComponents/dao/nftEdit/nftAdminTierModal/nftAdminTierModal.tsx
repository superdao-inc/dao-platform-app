import { useState, useMemo } from 'react';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { ethers } from 'ethers';
import styled from '@emotion/styled';
import cloneDeep from 'lodash/cloneDeep';
import { getNewTierId } from '@sd/superdao-shared';

import { Button, Input, Textarea, Title1 } from 'src/components';
import { ExtendedNftTierInput, NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { DEFAULT_TIER_ID } from 'src/pagesComponents/dao/nftEdit/constants';
import { BenefitsBlock } from './attributeBlocks/benefitsBlock';
import { CustomPropertiesBlock } from './attributeBlocks/customPropertiesBlock';
import { AchievementsContainer } from './attributeBlocks/achievementsBlock/achievementsContainer';
import { Shutter } from './shutter';
import { MaxAmountSelect } from './maxAmountSelect';
import { ArtworksContainer } from './artworks/artworksContainer';
import { ModalPage } from 'src/components/modalPage';

type Props = {
	index: number;
	onClose: () => void;
};

export const NftAdminTierModal = (props: Props) => {
	const { onClose, index } = props;
	const { t } = useTranslation();

	const { register, watch, setValue, control, resetField } = useFormContext<NftAdminUpdateCollectionTxInput>();

	const { errors, dirtyFields, defaultValues, isValid } = useFormState({ control });

	const [collectionName, tier] = watch(['name', `tiers.${index}`]);
	const [previewTierValue, setPreviewTierValue] = useState<ExtendedNftTierInput | undefined>(cloneDeep(tier));

	const { id: tierId } = tier || {};

	/**
	 * Узнаем, тир уже был в контракте или нет (новый или старый)
	 * Если новый, то даем изменять:
	 * Количество артворков, maxAmount, tierArtworkType
	 */
	const isNewTier = useMemo(() => {
		if (tierId === DEFAULT_TIER_ID) {
			return true;
		}

		const tier = defaultValues?.tiers?.find((tier) => tier?.id === tierId);

		return !tier;
	}, [tierId, defaultValues?.tiers]);

	const { remove: removeTier } = useFieldArray({ control, name: 'tiers' });
	const { remove: removeTierConfig } = useFieldArray({ control, name: 'tierConfigs' });

	const removeDraft = (idx: number) => {
		removeTier(idx);
		removeTierConfig(idx);
	};

	const handleSubmit = () => {
		if (tier?.id === DEFAULT_TIER_ID) {
			const newTierId = getNewTierId();
			setValue(`tiers.${index}.id`, newTierId);
			setValue(`tierConfigs.${index}.tierId`, newTierId);
		}
		onClose();
	};

	const handleClose = () => {
		if (tier?.id === DEFAULT_TIER_ID) {
			removeDraft(index);
			onClose();
			return;
		}

		if (previewTierValue) {
			setValue(`tiers.${index}`, previewTierValue);
		} else {
			resetField(`tiers.${index}`);
		}

		setPreviewTierValue(undefined);
		resetField(`tierConfigs.${index}`);
		onClose();
		return;
	};

	if (!tier) {
		return null;
	}

	return (
		<ModalPage onBack={handleClose} columnSize="custom" columnClassName="!w-[680px]">
			<div className="w-auto items-center">
				<Title1 className="mb-[16px]">
					{isNewTier ? t('modals.selfServiceTier.createTitle') : t('modals.selfServiceTier.editTitle')}
				</Title1>

				<div className="flex gap-5">
					<div className="w-[420px]">
						<div className="mb-4">
							<Input
								placeholder={t('modals.selfServiceTier.fields.name.placeholder')}
								label={t('modals.selfServiceTier.fields.name.label')}
								errorClassName="static"
								data-testid="NftAdminTierModal__tierName"
								{...register(`tiers.${index}.tierName`, {
									required: {
										value: true,
										message: t('modals.selfServiceTier.fields.name.errorEmpty')
									},
									validate: {
										bytesSize: (value) =>
											ethers.utils.toUtf8Bytes(value as string).length > 31
												? t<string>('modals.selfServiceTier.fields.name.errorSizeBytes')
												: true
									}
								})}
								error={errors?.tiers?.[index]?.tierName?.message}
							/>
						</div>

						<div className="mt-2">
							<MaxAmountSelect tierIdx={index} isNewTier={isNewTier} />
						</div>

						<CustomStyledTextArea
							error={errors.tiers?.[index]?.description?.message}
							placeholder={t('modals.selfServiceTier.fields.description.placeholder')}
							label={t('modals.selfServiceTier.fields.description.label')}
							info="(optional)"
							errorClassName="static"
							data-testid="NftAdminTierModal__description"
							labelClassName="mb-2"
							rows={1}
							disableMinHeight
							{...register(`tiers.${index}.description`, {
								maxLength: {
									value: 500,
									message: t('modals.selfServiceTier.fields.description.error')
								}
							})}
						/>

						<div className="mt-6">
							<Shutter
								btnLabel="Advanced settings"
								initState={tier.achievements.length > 0 || tier.benefits.length > 0 || tier.customProperties.length > 0}
							>
								<AchievementsContainer tierIdx={index} />
								<BenefitsBlock tierIdx={index} />
								<CustomPropertiesBlock tierIdx={index} />
							</Shutter>
						</div>
					</div>

					<div className="mt-8">
						<ArtworksContainer
							index={index}
							isNewTier={isNewTier}
							collectionName={collectionName}
							name={tier?.tierName ?? ''}
							amount={tier?.maxAmount}
						/>
					</div>
				</div>

				<div className="mt-8">
					<Button
						type="button"
						size="lg"
						color="accentPrimary"
						label={
							isNewTier ? t('modals.selfServiceTier.actions.createTier') : t('modals.selfServiceTier.actions.saveTier')
						}
						disabled={
							!!Object.keys(errors?.tiers?.[index] ?? {})?.length ||
							!Object.keys(dirtyFields?.tiers?.[index] ?? {})?.length ||
							!isValid
						}
						onClick={handleSubmit}
						data-testid="NftAdminTierModal__saveButton"
					/>
				</div>
			</div>
		</ModalPage>
	);
};

const CustomStyledTextArea = styled(Textarea)`
	min-height: 80px;
`;
