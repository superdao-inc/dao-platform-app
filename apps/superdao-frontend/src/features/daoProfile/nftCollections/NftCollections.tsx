import { memo, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';

import { CustomizeModal } from 'src/components/modals/customizeModal';
import { default as DaoNftCard } from 'src/features/daoProfile/nftCollections/DaoNftCard';
import { DropdownMenu, Loader, OpenseaOutlineIcon, Title2 } from 'src/components';
import { useDaoSales, useSwitch } from 'src/hooks';
import { colors } from 'src/style';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { getOpensealCollectionSearchUrl, openExternal } from 'src/utils/urls';
import { UserAPI } from 'src/features/user';

type NftCollectionsProps = {
	daoId: string;
	daoSlug: string;
	daoAddress: string;
	openseaUrl?: string | null;

	className?: string;
};

const NftCollections = (props: NftCollectionsProps) => {
	const { daoId, daoSlug, daoAddress, openseaUrl, className = '' } = props;

	const { t } = useTranslation();

	const [isCustomizeModalOpen, { off: closeCustomizeModal }] = useSwitch(false);

	const {
		data: collectionData,
		isLoading: isCollectionLoading,
		isRefetching
	} = useNftCollectionQuery({ daoAddress: daoAddress! }, { enabled: !!daoAddress });
	const { collection } = collectionData || {};

	const { isOpenSaleActive, isWhitelistSaleActive, isLoading: isSaleLoading } = useDaoSales(daoId, false);

	const { data: userData } = UserAPI.useCurrentUserQuery();

	const tiers = useMemo(() => {
		if (!collection?.tiers) return;

		return collection.tiers.filter((t) => !t.isDeactivated);
	}, [collection?.tiers]);

	const totalNfts = tiers?.length ?? 0;

	const hasMintedNft = useMemo(() => {
		if (!tiers) return;

		return tiers.filter((item) => item.maxAmount > 0 && item.totalAmount !== 0).length !== 0;
	}, [tiers]);

	const options = useMemo(
		() => [
			{
				label: t('pages.dao.nft.header.menu.openOpensea'),
				before: <OpenseaOutlineIcon />,
				onClick: () => {
					if (!collection) return;
					openExternal(openseaUrl || getOpensealCollectionSearchUrl(collection.collectionAddress));
				}
			}
		],
		[collection, openseaUrl, t]
	);

	if (tiers === undefined && (isCollectionLoading || isRefetching)) {
		return (
			<div className={cn('flex min-h-[40px] items-center justify-center', className)}>
				<Loader size="xl" />
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="mb-4 flex items-center justify-between">
				<div className="flex max-w-fit gap-2">
					<Title2 data-testid="DaoPage__nftCollectionsHeader">{t('pages.dao.nft.header.title')}</Title2>
					{Boolean(totalNfts) && (
						<Title2 data-testid="DaoPage__nftCollectionsCounter" color={colors.foregroundTertiary}>
							{totalNfts}
						</Title2>
					)}
				</div>
				<div className="flex items-center">
					{hasMintedNft && (
						<DropdownMenu
							className="hover:bg-overlaySecondary flex h-10 w-10 -translate-y-[6px] cursor-pointer items-center justify-center rounded-full transition-all"
							options={options}
							data-testid="DaoPage__nftCollectionsDropdown"
						/>
					)}
				</div>
			</div>
			<div
				className="relative mt-4 grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-5"
				data-testid="DaoPage__nftCollections"
			>
				{(tiers || []).map((tier) => (
					<DaoNftCard
						key={tier.id}
						tier={tier}
						collectionName={collection?.name}
						slug={daoSlug}
						daoAddress={daoAddress}
						walletAddress={userData?.currentUser.walletAddress}
						isOpenSaleActive={isOpenSaleActive}
						isWhitelistSaleActive={isWhitelistSaleActive}
						isSaleActive={
							(isOpenSaleActive && tier.salesActivity.openSale) ||
							(isWhitelistSaleActive && tier.salesActivity.whitelistSale)
						}
						isSaleLoading={isSaleLoading}
						isCollectionLoading={isCollectionLoading}
					/>
				))}
			</div>
			<CustomizeModal isOpen={isCustomizeModalOpen} onClose={closeCustomizeModal} />
		</div>
	);
};

export default memo(NftCollections);
