import { AirdropParticipant } from 'src/entities/nft/nft.types';
import { IMintInfo } from 'src/entities/nft/nft-client.service';

export const toPublicMintInfo = (airdrop: AirdropParticipant[]): IMintInfo[] => {
	return airdrop.map(({ walletAddress, tiers }) => ({
		userAddress: walletAddress,
		tier: tiers[0]
	}));
};
