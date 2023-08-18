import { DeepPartial } from 'typeorm';

import { User } from 'src/entities/user/user.model';
import { CollectionTierInfo } from 'src/entities/nft/nft.types';
import { updateArtwork } from 'src/entities/blockchain/mappers';
import { Whitelist } from 'src/entities/whitelist/whitelist.model';
import { shrinkWallet } from '@sd/superdao-shared';

export const getMailingListWithName = (users: DeepPartial<User>[]) => {
	const variables = users.reduce<Record<string, { name: string }>>((acc, user) => {
		if (user?.email) {
			acc[user.email] = {
				name: (user.displayName || user.ens || user.walletAddress) ?? ''
			};
		}
		return acc;
	}, {});

	const emails = Object.keys(variables);

	return { emails, variables };
};

export const getMailingListWithWalletAddress = (users: DeepPartial<User>[]) => {
	const variables = users.reduce<Record<string, { walletAddress: string }>>((acc, user) => {
		if (user?.email) {
			acc[user.email] = {
				walletAddress: shrinkWallet(user.walletAddress ?? '')
			};
		}
		return acc;
	}, {});

	const emails = Object.keys(variables);

	return { emails, variables };
};

export const getMailingListWithId = (users: DeepPartial<User>[]) => {
	const variables = users.reduce<Record<string, { id: string }>>((acc, user) => {
		if (user?.email) {
			acc[user.email] = {
				id: user.id ?? ''
			};
		}
		return acc;
	}, {});

	const emails = Object.keys(variables);

	return { emails, variables };
};

export const getMailingListWithWelcomeParams = (
	users: Array<DeepPartial<User> & { tiers: string[] }>,
	tiersInfo: Record<string, CollectionTierInfo>,
	tiersArtworkIds: Record<string, number>
) => {
	const variables = users.reduce<Record<string, { walletAddress: string; tierName: string; tierImage: string }>>(
		(acc, user) => {
			if (user?.email) {
				//@ts-ignore
				const artworkId = tiersArtworkIds?.[user.tiers];

				acc[user.email] = {
					walletAddress: shrinkWallet(user.walletAddress ?? ''),
					tierName: tiersInfo[user.tiers[0]].tierName || tiersInfo[user.tiers[0]].id,
					tierImage: updateArtwork(tiersInfo[user.tiers[0]].artworks[artworkId || 0]).image
				};
			}
			return acc;
		},
		{}
	);

	const emails = Object.keys(variables);

	return { emails, variables };
};

export const getMailingListWithClaimWhitelistParams = (
	users: Array<Whitelist>,
	tiersInfo: Record<string, CollectionTierInfo>
) => {
	const variables = users.reduce<Record<string, { id: string; tierName: string; tierImage: string; tierId: string }>>(
		(acc, user) => {
			if (user?.email) {
				acc[user.email] = {
					id: user.id ?? '',
					tierName: tiersInfo[user.tiers[0]].tierName || tiersInfo[user.tiers[0]].id,
					tierImage: updateArtwork(tiersInfo[user.tiers[0]].artworks[0]).image,
					tierId: tiersInfo[user.tiers[0]].id
				};
			}
			return acc;
		},
		{}
	);

	const emails = Object.keys(variables);

	return { emails, variables };
};
