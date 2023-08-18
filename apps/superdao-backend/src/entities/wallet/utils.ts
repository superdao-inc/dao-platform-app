import { BigNumber } from 'ethers';
import concat from 'lodash/concat';
import some from 'lodash/some';
import { getAddress } from '@sd/superdao-shared';
import { TokenBalance } from './dto/tokenBalance.dto';

export const normalizeToken = (acc: TokenBalance[], walletToken: TokenBalance) => {
	const addedTokens = acc.map((tokenBalance) => ({
		address: getAddress(tokenBalance?.token?.address),
		chainId: tokenBalance?.token?.chainId
	}));
	if (some(addedTokens, { address: getAddress(walletToken?.token?.address), chainId: walletToken?.token?.chainId })) {
		return acc.map((tokenBalance) => {
			if (tokenBalance?.token?.address === getAddress(walletToken?.token?.address)) {
				return {
					...tokenBalance,
					value: String(Number(tokenBalance.value) + Number(walletToken.value)),
					amount: BigNumber.from(tokenBalance.amount).add(BigNumber.from(walletToken.amount)).toString()
				};
			}
			return tokenBalance;
		});
	}

	return concat(acc, walletToken);
};
