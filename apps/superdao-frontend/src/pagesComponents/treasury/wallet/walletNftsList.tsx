import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { Nft } from '../nft';
import { SkeletonNftsBlock } from './skeletonNfts';
import { Body, Title2, Title3 } from 'src/components';
import { colors } from 'src/style';
import { MAX_PUBLIC_NFTS_COUNT } from 'src/pagesComponents/treasury/shared/constants';

import { ChainId, NftInfo, TreasuryWalletType } from 'src/types/types.generated';

type NftProps = NftInfo & {
	walletName?: string;
	walletType?: TreasuryWalletType;
	chainId?: ChainId | null;
};

type Props = {
	nfts: NftProps[];
	isLoading?: boolean;
	maxItems?: number;
	transparentBackground?: boolean;
	showChangeVisibilityOption?: boolean;
	isCreator?: boolean;
	currentUserAddress?: string;
	isNftTransferEnabled?: boolean;
	publicTreasuryNftsCount: number;
	currentNetwork: number | null;
	isQuickActionsEnabled: boolean;
	onChangeNftVisibility?: (id: string, isPublic: boolean) => void;
	refetchList?: () => void;
};

export const WalletNftsList = ({
	nfts,
	isLoading,
	maxItems,
	transparentBackground,
	showChangeVisibilityOption,
	isCreator,
	currentUserAddress,
	isNftTransferEnabled,
	currentNetwork,
	publicTreasuryNftsCount,
	isQuickActionsEnabled,
	refetchList,
	onChangeNftVisibility
}: Props) => {
	const { t } = useTranslation();

	const handleNftClick = () => {};

	const hiddenItemsCount = maxItems && nfts.length > maxItems ? nfts.length - maxItems : null;

	const publicNfts = nfts.filter((nft) => nft.isPublic);
	const hiddenNfts = nfts.filter((nft) => !nft.isPublic);
	const hasPublicNfts = publicNfts.length > 0;
	const hasHiddenNfts = hiddenNfts.length > 0;

	return (
		<>
			{isLoading ? (
				<SkeletonNftsBlock />
			) : (
				<div
					className={cn(!transparentBackground && 'bg-backgroundSecondary', 'mb-5 flex flex-col rounded-lg px-6 py-5')}
				>
					<Title2 className="py-4">{t('components.treasury.nfts_title.default')}</Title2>
					{hasPublicNfts && (
						<>
							<Title3 className="mb-2">
								{t('components.treasury.nfts_title.public')}
								<Title3 className="ml-2 inline" color={colors.foregroundTertiary}>
									{publicNfts.length}
								</Title3>
							</Title3>
							<div className="animate-[fadeIn_1s_ease-in]">
								<div className={`grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3`}>
									{publicNfts.slice(0, MAX_PUBLIC_NFTS_COUNT).map((nft) => (
										<Nft
											key={nft.id}
											onClick={handleNftClick}
											artworkProps={{
												artworks: nft.metadata ? [nft.metadata] : [],
												sliderProps: { isSlider: true }
											}}
											collectionName={nft.name}
											tokenId={nft.tokenId}
											isPublic={nft.isPublic}
											changeVisibility={() => onChangeNftVisibility?.(nft.id, !nft.isPublic)}
											walletName={nft.walletName}
											walletType={nft.walletType}
											chainId={nft.chainId}
											ownerOf={nft.ownerOf}
											tokenAddress={nft.tokenAddress}
											{...{
												isCreator,
												currentUserAddress,
												isNftTransferEnabled,
												showChangeVisibilityOption,
												refetchList,
												currentNetwork,
												isQuickActionsEnabled
											}}
										/>
									))}
								</div>
								{hiddenItemsCount && (
									<Body color={colors.foregroundTertiary} className="mt-3">{`+${hiddenItemsCount} more`}</Body>
								)}
							</div>
						</>
					)}
					{hasHiddenNfts && (
						<>
							<Title3 className={`mb-2 ${hasPublicNfts ? 'mt-4' : 'mt-0'}`}>
								{t('components.treasury.nfts_title.hidden')}
								<Title3 className="ml-2 inline" color={colors.foregroundTertiary}>
									{hiddenNfts.length}
								</Title3>
							</Title3>
							<div className="animate-[fadeIn_1s_ease-in]">
								<div className={`grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3`}>
									{hiddenNfts.slice(0, maxItems).map((nft) => (
										<Nft
											key={nft.id}
											onClick={handleNftClick}
											artworkProps={{
												artworks: nft.metadata ? [nft.metadata] : [],
												sliderProps: { isSlider: true }
											}}
											collectionName={nft.name}
											tokenId={nft.tokenId}
											isPublic={nft.isPublic}
											showChangeVisibilityOption={
												showChangeVisibilityOption && publicTreasuryNftsCount < MAX_PUBLIC_NFTS_COUNT
											}
											changeVisibility={() => onChangeNftVisibility?.(nft.id, !nft.isPublic)}
											walletName={nft.walletName}
											walletType={nft.walletType}
											chainId={nft.chainId}
											ownerOf={nft.ownerOf}
											tokenAddress={nft.tokenAddress}
											{...{
												isCreator,
												currentUserAddress,
												isNftTransferEnabled,
												refetchList,
												currentNetwork,
												isQuickActionsEnabled
											}}
										/>
									))}
								</div>
								{hiddenItemsCount && (
									<Body color={colors.foregroundTertiary} className="mt-3">{`+${hiddenItemsCount} more`}</Body>
								)}
							</div>
						</>
					)}
				</div>
			)}
		</>
	);
};
