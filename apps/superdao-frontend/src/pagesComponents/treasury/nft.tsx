import React, { FC, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { colors } from 'src/style';
import { ArtworkView, ArtworkViewProps } from 'src/components/artwork';
import { ChainId, NftOpenseaMetadata, TreasuryWalletType } from 'src/types/types.generated';
import { Ellipsis, Title3 } from 'src/components/text';
import { DropdownMenu, SendIcon, Caption, Label1 } from 'src/components';
import { TreasuryTransferNftsModal } from 'src/components/modals/treasuryTransferNftModal';
import { Hidden, MoreIcon, Visible } from 'src/components/assets/icons';
import { getNftClass } from 'src/pagesComponents/treasury/styles';

export type NftProps = {
	artworkProps: ArtworkViewProps;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
	collectionName: string;
	tokenId: string;
	isPage?: boolean;
	showTooltip?: boolean;
	isCreator?: boolean;
	ownerOf: string;
	tokenAddress: string;
	currentUserAddress?: string;
	walletName?: string;
	chainId?: ChainId | null;
	contractAddress?: string | null;
	walletType?: TreasuryWalletType;
	isNftTransferEnabled?: boolean;
	isPublic: boolean;
	showChangeVisibilityOption?: boolean;
	currentNetwork?: number | null;
	isQuickActionsEnabled: boolean;
	isMobile?: boolean;
	refetchList?: () => void;
	changeVisibility: () => void;
};

export const Nft: FC<NftProps> = (props) => {
	const {
		artworkProps,
		collectionName,
		tokenId,
		isPage,
		isCreator,
		ownerOf,
		tokenAddress,
		currentUserAddress,
		walletName,
		chainId,
		walletType,
		isNftTransferEnabled,
		isPublic,
		showChangeVisibilityOption,
		currentNetwork,
		isQuickActionsEnabled,
		isMobile,
		onClick,
		changeVisibility,
		refetchList
	} = props;
	const metadata = artworkProps.artworks as NftOpenseaMetadata[];
	const { t } = useTranslation();
	const [isTransferModalOpen, setTransferModalOpen] = useState(false);

	const nftTitle = !metadata || !metadata[0] || !metadata[0].name ? `${collectionName} ${tokenId}` : metadata[0].name;
	const dropdownOptions = [];

	const { wrapperClass, iconWrapperClass, squareWrapperClass, artworkViewClass } = getNftClass();

	if (showChangeVisibilityOption) {
		dropdownOptions.push({
			label: isPublic ? 'Hide' : 'Show',
			before: isPublic ? <Hidden /> : <Visible />,
			onClick: changeVisibility
		});
	}

	if (
		isCreator &&
		walletType &&
		walletType === TreasuryWalletType.Safe &&
		chainId === ChainId.PolygonMainnet &&
		isNftTransferEnabled
	) {
		dropdownOptions.push({
			label: t('components.treasury.transferNftModal.transfer'),
			before: <SendIcon fill={colors.foregroundSecondary} width={22} height={22} />,
			onClick: () => setTransferModalOpen(true)
		});
	}

	const showDropdownMenu = dropdownOptions.length > 0;
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleMenuSwitch = (isOpen: boolean) => {
		setIsMenuOpen(isOpen);
	};

	return (
		<>
			<div onClick={onClick} className={`${wrapperClass} ${isPage && 'sm:p-4'}`} data-testid={'Nft__wrapper'}>
				<div className={squareWrapperClass}>
					<ArtworkView
						{...artworkProps}
						className={`${artworkViewClass} 'xs:max-h-[156px]' h-full max-h-[220px] w-full max-w-[220px] rounded-lg`}
					/>
				</div>
				<div className={`${isMobile && 'px-3'} mt-3 gap-1`} data-testid={'Nft__collectionName'}>
					<Caption color={colors.foregroundTertiary}>
						<Ellipsis>{collectionName}</Ellipsis>
					</Caption>
				</div>
				<div className={`${isMobile && 'px-3 pb-2'} flex items-center gap-2`} data-testid={'Nft__title'}>
					<Ellipsis as={isMobile ? Label1 : Title3}>{nftTitle}</Ellipsis>
					{!isMobile && showDropdownMenu && (
						<DropdownMenu
							options={dropdownOptions}
							onSwitch={handleMenuSwitch}
							control={
								<div className={iconWrapperClass}>
									<MoreIcon fill={isMenuOpen ? colors.foregroundSecondary : colors.foregroundTertiary} />
								</div>
							}
							data-testid={'Nft__dropdownMenu'}
						/>
					)}
				</div>
			</div>
			{isTransferModalOpen && currentUserAddress && (
				<TreasuryTransferNftsModal
					isOpen={isTransferModalOpen}
					onClose={() => setTransferModalOpen(false)}
					senderAddress={currentUserAddress}
					{...{
						walletName,
						chainId,
						tokenAddress,
						tokenId,
						artworkProps,
						nftTitle,
						collectionName,
						metadata,
						refetchList,
						ownerOf,
						isNftTransferEnabled,
						currentNetwork,
						isQuickActionsEnabled
					}}
				/>
			)}
		</>
	);
};
