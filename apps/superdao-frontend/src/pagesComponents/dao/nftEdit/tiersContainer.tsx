import { useTranslation } from 'next-i18next';
import { FC, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useRouter } from 'next/router';

import styled from '@emotion/styled';
import { colors } from 'src/style';
import { getDefaultTierObject, getTierConfigDraft } from 'src/pagesComponents/dao/nftEdit/utils';
import { ExtendedNftTierInput, NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { TierList } from './tierList/tierList';
import { configureNftTiers } from './tierList/configureNftTiers';
import { AddBoldIcon, Cell, SubHeading, Title3 } from 'src/components';
import { NftAdminTierModalContainer } from './nftAdminTierModal/nftAdminTierModalContainer';

type Props = {
	daoSlug: string;
	contractAddress: string;
	collectionAddress: string;
};

export const TiersContainer: FC<Props> = (props) => {
	const { daoSlug, contractAddress, collectionAddress } = props;

	const { t } = useTranslation();

	const router = useRouter();

	const { control, watch, setValue } = useFormContext<NftAdminUpdateCollectionTxInput>();

	const [tiers] = watch(['tiers']);
	const { append: appendTier, remove: removeTier } = useFieldArray({
		control,
		name: 'tiers'
	});

	const [tierConfigs] = watch(['tierConfigs']);
	const {
		append: appendTierConfig,
		remove: removeTierConfig,
		move: moveTierConfigs,
		update: updateTierConfigs
	} = useFieldArray({
		control,
		name: 'tierConfigs'
	});

	const handleAddNewTier = () => {
		const tierToAdd = getDefaultTierObject();
		appendTier(tierToAdd);

		const tierConfigToAdd = getTierConfigDraft({
			tierId: tierToAdd.id,
			daoAddress: contractAddress,
			collectionAddress: collectionAddress
		});
		appendTierConfig(tierConfigToAdd);

		openTierModal(tierToAdd.id);
	};

	const handleRemoveItem = (index: number) => {
		const { tierId } = tierConfigs[index];
		const tierIdx = tiers.findIndex((tier) => tier.id === tierId);

		if (tierIdx === -1) {
			return;
		}

		if (tiers[tierIdx]?.totalAmount) {
			setValue(`tiers.${tierIdx}.isDeactivated`, true, { shouldDirty: true });
			return;
		}

		removeTier(tierIdx);
		removeTierConfig(index);
		return;
	};

	const openTierModal = useCallback(
		(tierId: string) => {
			const { slug, ...restQuery } = router.query;
			const searchParams = new URLSearchParams({ ...restQuery, tierId });

			router.push(`/${slug}/custom?${searchParams.toString()}`, undefined, { shallow: true });
		},
		[router]
	);

	const handleTierClick = useCallback(
		(clickedTier: ExtendedNftTierInput) => {
			if (clickedTier?.isDeactivated) {
				router.push(`/${daoSlug}/${clickedTier.id}`);
				return;
			}

			openTierModal(clickedTier.id);
		},
		[router, daoSlug, openTierModal]
	);

	const handleTiersOrderChange = (startIdx: number, endIdx: number) => {
		moveTierConfigs(startIdx, endIdx);
	};

	const handleTierHiddennessChange = (idx: number, isHidden: boolean) => {
		updateTierConfigs(idx, { ...tierConfigs[idx], isHidden });
	};

	return (
		<div className="w-full">
			<Title3>{t('pages.editNfts.collection.tiers.title')}</Title3>
			<StyledCaption className="text-foregroundTertiary mb-2">
				{t('pages.editNfts.collection.tiers.text')}
			</StyledCaption>

			{tiers && tiers.length > 0 && (
				<TierList
					tiers={configureNftTiers(tiers, tierConfigs)}
					onRemoveItem={handleRemoveItem}
					onClick={handleTierClick}
					onTiersOrderChange={handleTiersOrderChange}
					onHiddennessToggle={handleTierHiddennessChange}
				/>
			)}

			<NftAdminTierModalContainer />

			<Cell
				onClick={handleAddNewTier}
				size="auto"
				className="-mx-3 mt-3 rounded-lg"
				data-testid="TiersContainer__addButton"
				before={
					<div className="bg-overlayTertiary grid h-10 w-10 place-content-center rounded-full">
						<AddBoldIcon fill={colors.foregroundContrast} width={18} height={18} />
					</div>
				}
				label={t('pages.editNfts.collection.tiers.addButton')}
			/>
		</div>
	);
};

const StyledCaption = styled(SubHeading)`
	& a {
		color: ${colors.foregroundSecondary};
	}
`;
