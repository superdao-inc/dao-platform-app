import { useRouter } from 'next/router';
import { useFormContext } from 'react-hook-form';
import { ExtendedNftTierInput, NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { NftAdminTierModal } from './nftAdminTierModal';

export const NftAdminTierModalContainer = () => {
	const router = useRouter();
	const { slug, tierId, ...restQuery } = router.query;

	const { watch } = useFormContext<NftAdminUpdateCollectionTxInput>();
	const [tiers] = watch(['tiers']);

	if (!tierId) {
		return null;
	}

	const handleCloseModal = () => {
		const searchParams = new URLSearchParams(restQuery as any);

		router.push(`/${slug}/custom?${searchParams.toString()}`, undefined, { shallow: true });
	};

	const idx = tiers.findIndex((tier: ExtendedNftTierInput) => tierId === tier.id);

	if (idx === -1) {
		return null;
	}

	return <NftAdminTierModal index={idx} onClose={handleCloseModal} />;
};
