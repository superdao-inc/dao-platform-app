import React, { FC } from 'react';
import { colors } from 'src/style';
import { ArtworkView, ArtworkViewProps } from 'src/components/artwork';
import { NftOpenseaMetadata } from 'src/types/types.generated';
import { Ellipsis } from 'src/components/text';
import { Caption, Label1 } from 'src/components';
import { getNftClass } from 'src/pagesComponents/treasury/styles';

export type NftProps = {
	artworkProps: ArtworkViewProps;
	onClick?: (e: React.MouseEvent) => void;
	collectionName: string;
	tokenId: string;
};

export const MobileNft: FC<NftProps> = (props) => {
	const { artworkProps, collectionName, tokenId, onClick } = props;
	const metadata = artworkProps.artworks as NftOpenseaMetadata[];
	const nftTitle = !metadata || !metadata[0] || !metadata[0].name ? `${collectionName} ${tokenId}` : metadata[0].name;
	const { wrapperClass, squareWrapperClass, artworkViewClass } = getNftClass();

	return (
		<>
			<div onClick={onClick} className={`${wrapperClass} "pb-3"`} data-testid={'Nft__wrapper'}>
				<div className={`${squareWrapperClass} rounded-t-lg [&_img]:rounded-t-lg`} data-testid={'Nft__artworkView'}>
					<ArtworkView {...artworkProps} className={`${artworkViewClass} h-full w-full rounded-t-lg`} />
				</div>
				<div className="px-3">
					<div className="mt-3 gap-1" data-testid={'Nft__collectionName'}>
						<Caption color={colors.foregroundTertiary}>
							<Ellipsis>{collectionName}</Ellipsis>
						</Caption>
					</div>
					<div className="flex items-center gap-2" data-testid={'Nft__title'}>
						<Ellipsis as={Label1}>{nftTitle}</Ellipsis>
					</div>
				</div>
			</div>
		</>
	);
};
