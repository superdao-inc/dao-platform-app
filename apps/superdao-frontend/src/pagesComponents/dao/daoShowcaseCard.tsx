import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { ArtworkView, Ellipsis, Label1 } from 'src/components';
import { NftCardTierInfo } from 'src/components/nftCard/nftCardTierInfo';
import { PublicTreasuryNftsQuery } from 'src/gql/treasury.generated';
import { colors } from 'src/style';

type DaoShowcaseCardProps = {
	nft: NonNullable<PublicTreasuryNftsQuery['treasury']>['nfts'][number];
	isQueryLoading: boolean;
};

export const DaoShowcaseCard = (props: DaoShowcaseCardProps) => {
	const { nft, isQueryLoading } = props;

	const handleNftCardClick = () => {};
	const collectionName = nft.name;
	const nftName = nft.metadata?.name || `${nft.name} ${nft.tokenId}`;
	return (
		<Wrapper
			onClick={handleNftCardClick}
			className="min-h-[47%] min-w-[47%] max-w-[175px] rounded-xl p-0 sm:h-[225px] sm:min-w-[175px] sm:rounded sm:p-2.5"
		>
			<ArtworkView
				artworks={nft.metadata ? [nft.metadata] : []}
				sliderProps={{ isSlider: true }}
				className="h-auto min-h-[130px] w-full rounded-none rounded-t-xl sm:h-[155px] sm:w-[155px] sm:rounded"
			/>
			{nft &&
				(isQueryLoading ? (
					<SkeletonLoader />
				) : (
					<NftCardTierInfo
						className="pt-3 pl-3 sm:pt-2 sm:pl-0"
						tier={collectionName}
						collectionName={collectionName}
					/>
				))}
			<Ellipsis className="mb-3 mt-0.5 pl-3 capitalize sm:pl-0 " as={Label1}>
				{nftName}
			</Ellipsis>
		</Wrapper>
	);
};

const animation = keyframes`
	to {
		background-position-x: -200%;
	}
`;

export const Wrapper = styled.div`
	padding: 10px;
	background-color: ${colors.backgroundSecondary};
	scroll-snap-align: center;
	border-radius: 6px;
	transition-property: transform, shadow;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 150ms;
	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 0 96px 0 rgba(0, 0, 0, 0.08), 0 8px 48px 0 rgba(0, 0, 0, 0.16);
	}
`;

export const SkeletonLoader = styled.div`
	width: 50px;
	height: 12px;
	background: #eee;
	background: linear-gradient(
		110deg,
		${colors.backgroundTertiary} 8%,
		${colors.backgroundQuaternary} 18%,
		${colors.backgroundTertiary} 33%
	);
	border-radius: 8px;
	background-size: 200% 100%;
	animation: 1.5s ${animation} linear infinite;
`;
