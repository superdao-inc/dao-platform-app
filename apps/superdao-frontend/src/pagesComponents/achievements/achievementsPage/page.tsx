import isEmpty from 'lodash/isEmpty';
import { AchievementTierFragment } from 'src/gql/achievements.generated';

import { NftsList } from './nftList';

type Props = {
	slug: string;
	nfts: AchievementTierFragment[];
	currentUserAddress?: string;
	maxItems?: number;
	isMobile: boolean;
};

export const AchievementsNfts = (props: Props) => {
	const { slug, nfts, currentUserAddress, maxItems, isMobile } = props;

	return (
		<>
			{!isEmpty(nfts) && (
				<NftsList
					currentUserAddress={currentUserAddress}
					nfts={maxItems ? nfts.slice(0, maxItems) : nfts}
					slug={slug}
					isMobile={isMobile}
				/>
			)}
		</>
	);
};
