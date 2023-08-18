import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';
import { Nft } from './nft';
import { MobileNft } from './mobileNft';

import { flexWrapper } from './styles';
import { Body, ChevronRight, Title3 } from 'src/components';
import { colors } from 'src/style';
import { TreasuryWalletType, NftInfo, ChainId } from 'src/types/types.generated';

import { SkeletonNfts, SkeletonNftsBlock } from './wallet/skeletonNfts';
import { MobileSkeletonNfts } from './mobileSkeletons/skeletonNfts';
import { AuthAPI } from 'src/features/auth/API';

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
	slug?: string;
	refetchList?: () => void;
	onChangeNftVisibility?: (id: string, isPublic: boolean) => void;
};

export const NftsList = ({
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
	slug,
	refetchList,
	onChangeNftVisibility
}: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const hiddenItemsCount = maxItems && nfts.length > maxItems ? nfts.length - maxItems : null;
	const isAuthorized = AuthAPI.useIsAuthorized();

	const handleGoToNfts = () => isAuthorized && push(`/${slug}/treasury/nfts`);

	if (isEmpty(nfts) && !isLoading) return null;

	return (
		<>
			{isLoading ? (
				<>
					{isPage ? (
						<SkeletonNfts />
					) : isMobile ? (
						<>
							<div className="flex justify-between">
								<div className="flex gap-2">
									<Title3 className="capitalize">
										{t('components.treasury.nfts_title.default', { count: nfts.length })}
									</Title3>
									<Title3 color={colors.foregroundTertiary}>{nfts.length}</Title3>
								</div>
								<div>
									<ChevronRight width={16} height={16} fill={colors.foregroundTertiary} className="mt-1.5" />
								</div>
							</div>
							<MobileSkeletonNfts />
						</>
					) : (
						<SkeletonNftsBlock />
					)}
				</>
			) : isMobile ? (
				<div className="pt-3" data-testid={'NftsList__wrapper'}>
					<div className="flex justify-between" onClick={handleGoToNfts}>
						<div className="flex gap-2">
							<Title3 className="capitalize" data-testid={'NftsList__title'}>
								{t('components.treasury.nfts_title.default', { count: nfts.length })}
							</Title3>
							<Title3 color={colors.foregroundTertiary} data-testid={'NftsList__count'}>
								{nfts.length}
							</Title3>
						</div>
						{isAuthorized && (
							<div data-testid={'NftsList__allNftsButton'}>
								<ChevronRight width={16} height={16} fill={colors.foregroundTertiary} className="mt-1.5" />
							</div>
						)}
					</div>
					<div className={`mt-4 grid grid-cols-2 gap-4`}>
						{nfts.slice(0, maxItems).map((nft) => (
							<MobileNft
								key={nft.id}
								artworkProps={{
									artworks: nft.metadata ? [nft.metadata] : [],
									sliderProps: { isSlider: true }
								}}
								collectionName={nft.name}
								tokenId={nft.tokenId}
							/>
						))}
					</div>
				</div>
			) : (
				<div
					className={`${!transparentBackground && 'bg-backgroundSecondary'} mb-5 flex flex-col rounded-lg ${
						!isPage && 'px-6 py-5'
					}`}
					data-testid={'NftsList__wrapper'}
				>
					{listTitle && (
						<Title3 className="mb-4" data-testid={'NftsList__title'}>
							{listTitle.name}
							<Title3 className="ml-2 inline" color={colors.foregroundTertiary} data-testid={'NftsList__count'}>
								{listTitle.count}
							</Title3>
						</Title3>
					)}
					<div className="animate-[wiggle_10s_ease-in-out_infinite]">
						{!listTitle && (
							<div className={cn(flexWrapper, 'flex-col gap-0')}>
								<div className="flex gap-2">
									<Title3 className="capitalize">
										{t('components.treasury.nfts_title.default', { count: nfts.length })}
									</Title3>
									<Title3 color={colors.foregroundTertiary}>{nfts.length}</Title3>
								</div>
							</div>
						)}
						<div className={`grid gap-5 sm:grid-cols-3 xl:grid-cols-3`}>
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
