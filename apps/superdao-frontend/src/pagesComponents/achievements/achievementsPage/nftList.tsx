import isEmpty from 'lodash/isEmpty';
import defaultTo from 'lodash/defaultTo';

import flatten from 'lodash/flatten';
import { AchievementTierFragment } from 'src/gql/achievements.generated';

import { TreasuryWalletType, ChainId } from 'src/types/types.generated';
import { Nft } from './nft';

import { getAddress } from '@sd/superdao-shared';

type NftProps = AchievementTierFragment & {
	walletName?: string;
	chainId?: ChainId | null;
	walletType?: TreasuryWalletType;
};

type Props = {
	nfts: NftProps[];
	slug?: string;
	currentUserAddress?: string;
	isMobile: boolean;
};

export const NftsList = ({ nfts: nftTiers, currentUserAddress, slug, isMobile }: Props) => {
	if (isEmpty(nftTiers)) return null;

	const nftTiersByCurrentUser = flatten(
		nftTiers
			.filter((nftTier) =>
				nftTier.owners.map(({ walletAddress }) => walletAddress).includes(defaultTo(getAddress(currentUserAddress), ''))
			)
			.map((nftTier) => nftTier)
	);

	const tiersCount = nftTiersByCurrentUser.reduce(
		(acc, tier) =>
			tier.tierName
				? {
						...acc,
						[tier.tierName]: tier.owners.filter(
							(owner) => getAddress(owner.walletAddress) === getAddress(currentUserAddress)
						).length
				  }
				: acc,
		{} as { [tierName: string]: number }
	);

	return (
		<>
			<div className={`grid grid-cols-2 gap-[18px] md:grid-cols-3`}>
				{nftTiers.map((nft) => {
					const nftTierValue =
						nft.metadata?.attributes?.filter((attr) => attr.traitType === 'Tier').map((attr) => attr.value)[0] || '';

					return (
						<Nft
							key={nft.id}
							id={nft.id}
							artworkProps={{
								artworks: nft.artworks,
								sliderProps: {
									isSlider: true,
									className:
										'h-full max-h-[156px] max-w-[156px] sm:max-h-[220px] sm:max-w-[240px] w-full [&_img]:rounded-lg [&_img]:sm:max-h-[190px]'
								}
							}}
							metadata={nft.metadata}
							collectionName={nft.collectionName}
							tierName={nft.tierName}
							description={nft.description}
							membersCount={nft.owners.length}
							slug={slug}
							nftCount={tiersCount[nftTierValue]}
							isAchieved={nft.owners
								.map(({ walletAddress }) => walletAddress)
								.includes(defaultTo(getAddress(currentUserAddress), ''))}
							isMobile={isMobile}
						/>
					);
				})}
			</div>
		</>
	);
};
