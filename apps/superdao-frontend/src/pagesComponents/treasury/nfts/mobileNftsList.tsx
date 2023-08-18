import cn from 'classnames';
import { Body, Title3 } from 'src/components';
import { colors } from 'src/style';
import { TreasuryWalletType, NftInfo, ChainId } from 'src/types/types.generated';

import { Nft } from '../nft';
import { SkeletonNfts, SkeletonNftsBlock } from '../wallet/skeletonNfts';

type NftProps = NftInfo & {
	walletName?: string;
	chainId?: ChainId | null;
	walletType?: TreasuryWalletType;
};

type Props = {
	nfts: NftProps[];
	listTitle?: { name: string; count: number };
	isPage?: boolean;
	isLoading?: boolean;
	maxItems?: number;
	isCreator?: boolean;
	currentUserAddress?: string;
	isNftTransferEnabled?: boolean;
	transparentBackground?: boolean;
	showChangeVisibilityOption?: boolean;
	isQuickActionsEnabled: boolean;
	isMobile?: boolean;
	refetchList?: () => void;
	onChangeNftVisibility?: (id: string, isPublic: boolean) => void;
};

export const MobileNftsList = ({
	nfts,
	isPage,
	isLoading,
	maxItems,
	isCreator,
	currentUserAddress,
	isNftTransferEnabled,
	listTitle,
	transparentBackground,
	showChangeVisibilityOption,
	isQuickActionsEnabled,
	isMobile,
	refetchList,
	onChangeNftVisibility
}: Props) => {
	const hiddenItemsCount = maxItems && nfts.length > maxItems ? nfts.length - maxItems : null;

	return (
		<>
			{isLoading ? (
				<>{isPage ? <SkeletonNfts /> : <SkeletonNftsBlock />}</>
			) : (
				<div
					className={cn(
						'mx-auto mb-5 flex flex-col rounded-lg pt-4',
						!isPage && 'px-6 py-5',
						!transparentBackground && 'bg-backgroundSecondary'
					)}
					data-testid={'NftsList__wrapper'}
				>
					{listTitle && (
						<Title3 color={colors.foregroundTertiary} data-testid={'NftsList__title'}>
							{listTitle.name}
						</Title3>
					)}
					<div className="animate-[fadeIn_1s_ease-in]">
						<div className={`mt-4 grid grid-cols-2 items-center gap-2 gap-y-5 sm:grid-cols-3 sm:gap-5`}>
							{nfts.slice(0, maxItems).map((nft) => (
								<Nft
									key={nft.id}
									artworkProps={{
										artworks: nft.metadata ? [nft.metadata] : [],
										sliderProps: { isSlider: true }
									}}
									collectionName={nft.name}
									tokenId={nft.tokenId}
									isPage={isPage}
									isPublic={nft.isPublic}
									showChangeVisibilityOption={showChangeVisibilityOption}
									changeVisibility={() => onChangeNftVisibility?.(nft.id, !nft.isPublic)}
									walletName={nft.walletName}
									chainId={nft.chainId}
									tokenAddress={nft.tokenAddress}
									walletType={nft.walletType}
									ownerOf={nft.ownerOf}
									isNftTransferEnabled={isNftTransferEnabled}
									isMobile={isMobile}
									{...{ isQuickActionsEnabled, refetchList, isCreator, currentUserAddress }}
								/>
							))}
						</div>
						{hiddenItemsCount && (
							<Body color={colors.foregroundTertiary} className="mt-3">{`+${hiddenItemsCount} more`}</Body>
						)}
					</div>
				</div>
			)}
		</>
	);
};
