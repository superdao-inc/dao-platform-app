import { ethers } from 'ethers';
import { IPFS_PREFIX } from 'src/constants';
import { config } from 'src/config';
import { AirdropParticipant } from 'src/entities/nft/nft.types';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';

/** Хэширует строку для kernel.getAppAddress
 */
export const getKeccak256 = (str: string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));

/** Проверяет существование контракта по его адресу. Если адрес 0x00000..., то контракта не существует
 */
export const isContractExist = (contractAddress?: string) => contractAddress !== ethers.constants.AddressZero;

export const getIpfsUrlByHash = (hash: string) => {
	return hash.replace(IPFS_PREFIX, `${config.urls.infuraCacheProxyServerUrl}/ipfs/`);
};

export const bigNumberToNumber = (bigNum: ethers.BigNumber) => parseInt(bigNum._hex, 16);

export const resolveAirdropEns = async (participants: AirdropParticipant[]): Promise<AirdropParticipant[]> => {
	return Promise.all(
		participants.map(async ({ walletAddress, email, tiers }) => {
			const resolvedAddress = await EnsResolver.resolve(walletAddress);
			if (!resolvedAddress) {
				throw Error(`Ens cant resolve ${walletAddress}`);
			}

			return {
				walletAddress: resolvedAddress,
				email,
				tiers
			};
		})
	);
};
