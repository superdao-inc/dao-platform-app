import { useFormContext } from 'react-hook-form';
import { NftCardAttributes, NftCardAttributesProps } from 'src/components/nftCard/nftCardAttributes';
import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';

type CustomBenefitsProps = Omit<NftCardAttributesProps, 'benefits' | 'customProperties'> & {
	tierIdx: number;
};

export const NftCardAttributesContainer = ({ tierIdx, ...props }: CustomBenefitsProps) => {
	const { watch } = useFormContext<NftAdminUpdateCollectionTxInput>();
	const [benefits, customProperties] = watch([`tiers.${tierIdx}.benefits`, `tiers.${tierIdx}.customProperties`]);

	const filteredBenefits = benefits.filter((one) => (one.valueString?.length || 0) > 1);
	const filteredCustomProperties = customProperties.filter((one) => (one.valueString?.length || 0) > 1);

	if (filteredBenefits.length === 0 && filteredCustomProperties.length === 0) {
		return null;
	}

	return <NftCardAttributes {...props} benefits={filteredBenefits} customProperties={filteredCustomProperties} />;
};
