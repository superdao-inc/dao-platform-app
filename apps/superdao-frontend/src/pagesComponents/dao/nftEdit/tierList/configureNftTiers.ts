import keyBy from 'lodash/keyBy';
import { ExtendedNftTier, NftTierConfig } from 'src/types/types.generated';

export type ConfiguredNftTier = ExtendedNftTier & { isHidden: boolean };

export function configureNftTiers(tiers: ExtendedNftTier[], configs: NftTierConfig[]): ConfiguredNftTier[] {
	const dict = keyBy(tiers, 'id');

	const configuredTiers = configs.map((config) => {
		const tier = dict[config.tierId];
		if (tier) {
			return { isHidden: config.isHidden, ...tier };
		}

		return null;
	});
	const filtered = configuredTiers.filter(Boolean) as ConfiguredNftTier[];

	return filtered;
}
