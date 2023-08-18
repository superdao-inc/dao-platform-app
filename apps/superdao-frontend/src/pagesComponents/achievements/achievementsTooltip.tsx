/* eslint-disable prettier/prettier */
import countBy from 'lodash/countBy';
import defaultTo from 'lodash/defaultTo';
import identity from 'lodash/identity';
import uniqWith from 'lodash/uniqWith';

import { Caption, SubHeading } from 'src/components';
import { colors } from 'src/style';
import { Body } from 'src/components/text';
import { AchievementNftFragment } from 'src/gql/achievements.generated';
import { MetadataAttributesSdTraits } from 'src/pagesComponents/dao/nftEdit/types';

const MAX_VISIBLE_ACHIEVEMENTS = 4;

export const TooltipAchievements = (props: { achievementNFTs: AchievementNftFragment[] }) => {
	const achievementsCount = countBy(
		props.achievementNFTs.map((nft) =>
			nft.metadata?.attributes?.filter((attr) => attr.sdTrait === MetadataAttributesSdTraits.TIER_SD_TRAIT).map((attr) => attr.value)
		),
		identity
	);

	const uniqAchievementNfts = uniqWith(
		props.achievementNFTs,
		(nft1, nft2) => 
				nft1.metadata?.attributes?.find((attr) => attr.sdTrait === MetadataAttributesSdTraits.TIER_SD_TRAIT)?.value ===
				nft2.metadata?.attributes?.find((attr) => attr.sdTrait === MetadataAttributesSdTraits.TIER_SD_TRAIT)?.value
	);

	return (
		<>
			{uniqAchievementNfts.map((achievementNft, id) => {
				if (id > MAX_VISIBLE_ACHIEVEMENTS) return;
				const achievementAttr = achievementNft.metadata?.attributes
					?.filter((attr) => attr.sdTrait === MetadataAttributesSdTraits.TIER_SD_TRAIT)
					.map((attr) => defaultTo(attr.value, ''))[0];

				return (
					<SubHeading key={achievementNft.tokenId + id} className="pb-1 last-of-type:pb-0">
						{id < MAX_VISIBLE_ACHIEVEMENTS && achievementAttr ? (
							<>
								<div className="flex">
									<img
										className="object-cente mr-3 h-6 w-6 rounded-full object-cover"
										src={achievementNft?.metadata?.image || ''}

									/>
									<Body className="pr-1">{achievementAttr}</Body>
									<Body color={colors.foregroundTertiary}>
										{achievementsCount[achievementAttr] > 1 && achievementsCount[achievementAttr]}
									</Body>
								</div>
							</>
						) : (
							<Caption color={colors.foregroundTertiary}>{`and ${
								props.achievementNFTs.length - MAX_VISIBLE_ACHIEVEMENTS
							} more...`}</Caption>
						)}
					</SubHeading>
				);
			})}
		</>
	);
};
