import { NftTier } from 'src/entities/nft/nft.types';
import { TierConfig } from 'src/entities/tierConfig/tierConfig.model';

type TierAndConfig = {
	tier: NftTier;
	config: TierConfig;
};
type OptTierAndConfig = Partial<TierAndConfig>;
type TierAndConfigDict = { [key: string]: OptTierAndConfig };

export const combineTiersAndConfigs = (tiers: NftTier[] = [], configs: TierConfig[] = []) => {
	const len = Math.max(tiers.length, configs.length);

	const pairs: TierAndConfigDict = {};

	for (let i = 0; i < len; i += 1) {
		const someTier = tiers[i];

		if (someTier) {
			if (!pairs[someTier.id]) {
				pairs[someTier.id] = {};
			}
			pairs[someTier.id].tier = someTier;
		}

		const someConfig = configs[i];
		if (someConfig) {
			if (!pairs[someConfig.tierId]) {
				pairs[someConfig.tierId] = {};
			}
			pairs[someConfig.tierId].config = someConfig;
		}
	}

	return pairs;
};

type FilterOpts = { getDefaultConfig: (params: { tierId: string; position: number }) => Partial<TierConfig> };

export const filterTiersAndConfigs = (pairs: TierAndConfigDict, { getDefaultConfig }: FilterOpts) => {
	const configsToDeleting: TierConfig[] = [];
	const tiersWithConfigs: TierAndConfig[] = [];
	const tiersWithFakeConfigs: TierAndConfig[] = [];

	Object.values(pairs).forEach((pair) => {
		if (pair.tier && pair.config) {
			tiersWithConfigs.push(pair as TierAndConfig);
		}

		if (pair.tier && !pair.config) {
			const tierWithDefaultConfig = {
				...pair,
				config: getDefaultConfig({ tierId: pair.tier.id, position: 100 })
			};

			tiersWithFakeConfigs.push(tierWithDefaultConfig as TierAndConfig);
		}

		if (!pair.tier && pair.config) {
			configsToDeleting.push(pair.config);
		}
	});

	return { configsToDeleting, tiersWithConfigs, tiersWithFakeConfigs };
};

export const orderTiersWithConfigs = (pairs: TierAndConfig[]) => {
	return pairs.sort((one, two) => {
		return one.config.position - two.config.position;
	});
};

export const orderTiersWithFakeConfigs = (pairs: TierAndConfig[]) => {
	return pairs.sort((one, two) => {
		return one.tier.maxAmount > two.tier.maxAmount ? 1 : -1;
	});
};

export const filterTiersByConfigData = (pairs: TierAndConfig[]) => {
	const merged: NftTier[] = [];

	pairs.forEach((pair) => {
		!pair.config.isHidden && merged.push(pair.tier);
	});

	return merged;
};

export const getOnlyConfigsFromCombined = (pairs: TierAndConfig[]) => {
	return pairs.map((pair) => pair.config);
};
