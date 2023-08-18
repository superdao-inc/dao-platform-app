import {
	combineTiersAndConfigs,
	filterTiersAndConfigs,
	filterTiersByConfigData,
	orderTiersWithConfigs,
	orderTiersWithFakeConfigs
} from 'src/utils/tierAndConfigUtils';
import { NftTier } from '../nft/nft.types';
import { TierConfig } from '../tierConfig/tierConfig.model';

const getDefaultConfig = ({ tierId, position = 0 }: { tierId: string; position: number }) => {
	return {
		id: '010110100',
		tierId,
		daoAddress: '0x',
		collectionAddress: '0x',
		isHidden: false,
		position
	};
};

export const enrichTiersWithConfigs = (tiers: NftTier[], configs: TierConfig[]) => {
	const combinedPairs = combineTiersAndConfigs(tiers, configs);
	const { tiersWithConfigs, tiersWithFakeConfigs } = filterTiersAndConfigs(combinedPairs, { getDefaultConfig });
	const orderedTiersWithConfigs = orderTiersWithConfigs(tiersWithConfigs);
	const orderedTiersWithNoConfigs = orderTiersWithFakeConfigs(tiersWithFakeConfigs);
	const filtered = filterTiersByConfigData([...orderedTiersWithConfigs, ...orderedTiersWithNoConfigs]);
	return filtered;
};
