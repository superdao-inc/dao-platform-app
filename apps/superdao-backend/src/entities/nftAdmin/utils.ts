import { v4 } from 'uuid';
import {
	combineTiersAndConfigs,
	filterTiersAndConfigs,
	getOnlyConfigsFromCombined,
	orderTiersWithConfigs,
	orderTiersWithFakeConfigs
} from 'src/utils/tierAndConfigUtils';
import { NftTier } from '../nft/nft.types';
import { TierConfig } from '../tierConfig/tierConfig.model';

type Params = {
	tiers: NftTier[];
	configs: TierConfig[];
	daoAddress: string;
	collectionAddress: string | null;
};

export const prepareConfigs = ({ tiers, configs, daoAddress, collectionAddress }: Params) => {
	const getDefaultConfig = ({ tierId, position = 0 }: { tierId: string; position: number }) => {
		return {
			id: v4(),
			tierId,
			daoAddress,
			collectionAddress: collectionAddress || '',
			isHidden: false,
			position
		};
	};

	const combined = combineTiersAndConfigs(tiers, configs);
	const { tiersWithConfigs, tiersWithFakeConfigs, configsToDeleting } = filterTiersAndConfigs(combined, {
		getDefaultConfig
	});

	const orderedTiersWithConfigs = orderTiersWithConfigs(tiersWithConfigs);
	const orderedTiersWithFakeConfigs = orderTiersWithFakeConfigs(tiersWithFakeConfigs);

	const orderedConfigs = getOnlyConfigsFromCombined([...orderedTiersWithConfigs, ...orderedTiersWithFakeConfigs]);

	return { orderedConfigs, configsToDeleting };
};
