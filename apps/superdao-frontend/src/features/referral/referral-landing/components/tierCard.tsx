import Link from 'next/link';
import { FC } from 'react';
import { NftCard, NftCardTierInfo, NftCardTitle } from 'src/components';
import { Star4 } from 'src/components/assets/arts';
import { colors } from 'src/style';
import { NftTier } from 'src/types/types.generated';

type Props = {
	tier: NftTier;
	collectionName?: string;
	limitLeft?: number;
	limitExceeded: boolean;
	daoName: string;
	tierLink: string;
	className: string;
};

export const TierCard: FC<Props> = (props) => {
	const { tier, limitLeft, limitExceeded, collectionName, daoName, tierLink, className } = props;
	return (
		<div className={`mx-auto mt-6 max-w-md flex-none px-12 md:mt-20 md:w-[30%] md:max-w-[335px] md:px-0 ${className}`}>
			{tier && collectionName && tierLink && (
				<Link href={tierLink} passHref>
					<a>
						<NftCard
							className="shadow-[0_0_27px_rgba(0,0,0,0.3)] lg:p-[22px]"
							artworkProps={{
								artworks: tier.artworks,
								artworksTotalLength: tier.artworksTotalLength,
								sliderProps: { isSlider: true },
								wrapperClassName: 'lg:h-auto lg:w-auto aspect-[1/1]'
							}}
							data-testid={`NftCard__${tier.id}`}
						>
							<NftCardTierInfo tierArtworkType={tier.tierArtworkType} tier={collectionName} />
							<NftCardTitle className="mt-2 text-2xl" content={tier.tierName || ''} />
							<div className="text-foregroundSecondary text-lg">{daoName}</div>
						</NftCard>
					</a>
				</Link>
			)}
			{limitExceeded && (
				<div className="mt-4 flex items-center justify-center text-white md:mt-[30px]">
					<div className="bg-accentMuted text-sfpro flex items-center px-4 py-3 text-[20px] font-bold leading-none">
						All NFTs were claimed!&nbsp;
						<Star4 fill={colors.tintOrange} width={16} height={16} />
					</div>
				</div>
			)}
			{!limitExceeded && !!limitLeft && (
				<div className="font-montserrat mt-4 flex items-center justify-center text-white md:mt-[30px]">
					<div className="bg-tintBlue mr-2 rounded-full px-2 py-1 text-sm leading-none md:mr-3 md:px-2.5 md:text-[22px]">
						{limitLeft}
					</div>
					<div className="text-base md:text-xl">NFTs&nbsp;available to&nbsp;share</div>
				</div>
			)}
		</div>
	);
};
