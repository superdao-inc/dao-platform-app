import { useMemo } from 'react';
import { useNftCollectionQuery } from 'src/gql/nft.generated';

export const useCollectionTiersById = (daoAddress: string) => {
	const { data: collectionData } = useNftCollectionQuery({ daoAddress }, { enabled: !!daoAddress });
	const tiers = collectionData?.collection?.tiers;
	const tiersHash = useMemo(() => {
		if (!tiers) return {};

		return Object.fromEntries(tiers.map((t) => (!t.isDeactivated ? [t.id, t.tierName || t.id] : [])));
	}, [tiers]);

	return tiersHash;
};
