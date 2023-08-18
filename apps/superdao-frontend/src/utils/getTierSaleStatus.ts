import { TierSaleStatus } from 'src/constants/tierSaleStatus';

type Type = {
	isAuthorized: boolean;
	isOpenSaleActive: boolean;
	isPrivateSaleActive: boolean;
	walletAddressVerify: boolean;
	hasEnoughUnitsToBuy: boolean;
	isClaim: boolean;
};

export const getTierSaleStatus = ({
	isAuthorized,
	isOpenSaleActive,
	isPrivateSaleActive,
	walletAddressVerify,
	hasEnoughUnitsToBuy,
	isClaim
}: Type) => {
	if (isClaim && hasEnoughUnitsToBuy) {
		return TierSaleStatus.CLAIM;
	}

	//если нет сейлов
	if (!isOpenSaleActive && !isPrivateSaleActive) {
		return TierSaleStatus.EMPTY;
	}

	//если нфт кончились
	if (!hasEnoughUnitsToBuy) {
		return TierSaleStatus.NOT_AVAILABLE;
	}

	//если нет логина
	if (!isAuthorized) {
		//и нет опенсейла
		if (!isOpenSaleActive) {
			return TierSaleStatus.AUTHORIZATION;
		}

		//есть опенсейл
		if (isOpenSaleActive) {
			return TierSaleStatus.OPEN_SALE;
		}
	}

	//если включены оба сейла
	if (isPrivateSaleActive && isOpenSaleActive) {
		//Кошелек в вайтлисте
		if (walletAddressVerify) {
			return TierSaleStatus.PRIVATE_SALE;
		}

		return TierSaleStatus.OPEN_SALE;
	}

	//если только Private sale
	if (isPrivateSaleActive && !isOpenSaleActive) {
		//Кошелек в вайтлисте
		if (walletAddressVerify) {
			return TierSaleStatus.PRIVATE_SALE;
		}

		return TierSaleStatus.NOT_IN_WHITELIST;
	}

	//если только Open sale
	if (!isPrivateSaleActive && isOpenSaleActive) {
		return TierSaleStatus.OPEN_SALE;
	}

	return TierSaleStatus.OPEN_SALE;
};
