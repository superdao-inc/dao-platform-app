import { useMemo } from 'react';
import { AuthAPI } from 'src/features/auth';
import { CollectionInfoByTierQuery, useVerifyWhitelistSaleQuery } from 'src/gql/nft.generated';
import { useTierPrice } from 'src/pagesComponents/nft/details/hooks/use-tier-price';
import { getTierSaleStatus } from 'src/utils/getTierSaleStatus';

type Props = {
	isCollectionOpenSaleActive: boolean;
	isCollectionPrivateSaleActive: boolean;
	daoId: string;
	daoAddress: string;
	tier: string;
	totalPrice: CollectionInfoByTierQuery['collectionInfoByTier']['totalPrice'];
	amount: {
		max: number;
		total: number;
	};
	isClaim: boolean; //specific props
	currency: string;
};

export const useStatusSaleTierByConditional = ({
	//maybe get from useDaoSales here, not outside hook..
	isCollectionOpenSaleActive,
	isCollectionPrivateSaleActive,
	daoAddress,
	tier,
	totalPrice,
	amount,
	isClaim,
	currency
}: Props) => {
	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: verify, isLoading: isLoadingVerify } = useVerifyWhitelistSaleQuery(
		{ daoAddress, tier },
		{ enabled: isCollectionPrivateSaleActive && isAuthorized }
	);

	const walletAddressVerify = Boolean(verify?.getVerify);

	const checkPrivateSaleAndPrice = isCollectionPrivateSaleActive && Boolean(Number(totalPrice?.whitelistSale));
	const checkOpenSaleAndPrice = isCollectionOpenSaleActive && Boolean(Number(totalPrice?.openSale));

	const hasEnoughUnitsToBuy = amount.max > amount.total;

	const { tokenAmount, fiatAmount, tokenSymbol, fiatSymbol } = useTierPrice({
		isOpenSaleActive: checkOpenSaleAndPrice,
		isPrivateSaleAndUserVerified: checkPrivateSaleAndPrice && walletAddressVerify,
		totalPrice,
		currency
	});

	const status = getTierSaleStatus({
		isAuthorized,
		isOpenSaleActive: checkOpenSaleAndPrice,
		isPrivateSaleActive: checkPrivateSaleAndPrice,
		walletAddressVerify,
		hasEnoughUnitsToBuy,
		isClaim
	});

	const fiatPrice = useMemo(
		() => ({
			amount: fiatAmount,
			currency: fiatSymbol
		}),
		[fiatAmount, fiatSymbol]
	);
	const tokenPrice = useMemo(
		() => ({
			amount: tokenAmount,
			currency: tokenSymbol
		}),
		[tokenAmount, tokenSymbol]
	);

	return {
		isLoading: isLoadingVerify,
		status,
		fiatPrice,
		tokenPrice
	};
};
