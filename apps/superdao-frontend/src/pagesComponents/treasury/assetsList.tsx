import { useTranslation } from 'next-i18next';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import cn from 'classnames';
import React from 'react';
import { AssetRow } from './assetRow';
import { MobileAssetRow } from './mobileAssetRow';
import { flexWrapper } from './styles';
import { Body, ChevronRight, Label3, Title3 } from 'src/components';
import { colors } from 'src/style';
import { useNetworksQuery } from 'src/gql/networks.generated';
import { TokenBalance } from 'src/types/types.generated';
import { SkeletonAssets, SkeletonAssetsBlock } from './skeletonAssets';
import { MobileSkeletonAssets } from './mobileSkeletons/skeletonAssets';
import { AuthAPI } from 'src/features/auth/API';

type Props = {
	list: Partial<TokenBalance>[];
	maxItems?: number;
	withTitle?: boolean;
	isLoading?: boolean;
	isPage?: boolean;
	isQuickActionsEnabled?: boolean;
	isMobile?: boolean;
};

const defaultChains = {
	POLYGON: 137,
	MUMBAI: 80001
};

const SHOW_ITEMS_COUNT = 3;

export const AssetsList = ({
	list,
	maxItems,
	withTitle,
	isLoading,
	isPage,
	isQuickActionsEnabled,
	isMobile
}: Props) => {
	const { t } = useTranslation();
	const networks = useNetworksQuery().data?.networks;
	const { push, query } = useRouter();

	const handleGoToAssets = () => push(`/${query.slug}/treasury/assets`);

	const hiddenItemsCount =
		maxItems && !isQuickActionsEnabled ? (list.length && list.length > maxItems ? list.length - maxItems : null) : null;
	const showItemsCount = isQuickActionsEnabled && maxItems ? SHOW_ITEMS_COUNT : maxItems;
	const isAuthorized = AuthAPI.useIsAuthorized();

	const showChevron = isQuickActionsEnabled && list?.length > SHOW_ITEMS_COUNT;
	const TitleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
		showChevron ? <button onClick={handleGoToAssets}>{children}</button> : <>{children}</>;

	if (isEmpty(list) && !isLoading) return null;

	const SkeletonComponent = () =>
		isPage ? <SkeletonAssets /> : isMobile ? <MobileSkeletonAssets /> : <SkeletonAssetsBlock />;

	return (
		<>
			{isLoading ? (
				<SkeletonComponent />
			) : isMobile ? (
				<div
					className="bg-backgroundSecondary mb-5 flex flex-col rounded-b-lg px-6 pb-5"
					data-testid={'AssetsList__wrapper'}
				>
					<div className="animate-[fadeIn_1s_ease-in]">
						<div className="flex justify-between">
							<Body
								className="font-semibold capitalize"
								color={colors.foregroundTertiary}
								data-testid={'AssetsList__title'}
							>
								{t('components.treasury.assets', { count: list.length })}
							</Body>
							{showChevron && isAuthorized && (
								<Body
									className="font-semibold"
									color={colors.accentPrimary}
									onClick={handleGoToAssets}
									data-testid={'AssetsList__allAssetsButton'}
								>
									{t('components.treasury.seeAll')}
								</Body>
							)}
						</div>
						{list.slice(0, showItemsCount).map(({ token, amount, value }) => {
							const network =
								token?.chainId !== defaultChains.MUMBAI && token?.chainId !== defaultChains.POLYGON
									? networks?.find((chain) => chain.chainId === token?.chainId)?.title
									: undefined;

							return (
								<MobileAssetRow
									key={token?.address}
									balance={amount}
									logo={token?.iconUrl}
									decimals={token?.decimals || 18}
									value={value}
									symbol={token?.symbol}
									name={token?.name}
									network={network}
								/>
							);
						})}
					</div>
				</div>
			) : (
				<div
					className="bg-backgroundSecondary mb-5 flex flex-col rounded-lg px-6 py-5"
					data-testid={'AssetsList__wrapper'}
				>
					<div className="animate-[fadeIn_1s_ease-in]">
						{withTitle && (
							<TitleWrapper>
								<div className={cn(flexWrapper, 'flex-row items-center gap-2')}>
									<Title3 className="capitalize" data-testid={'AssetsList__title'}>
										{t('components.treasury.assets', { count: list.length })}
									</Title3>
									<Title3 color={colors.foregroundTertiary} data-testid={'AssetsList__allAssetsButton'}>
										{list.length}
									</Title3>
									{showChevron && (
										<ChevronRight width={16} height={16} fill={colors.foregroundTertiary} className="mt-1" />
									)}
								</div>
							</TitleWrapper>
						)}
						{!isEmpty(list) && (
							<div className="mb-3 grid grid-cols-12" data-testid={'AssetsList__table'}>
								<Label3
									color={colors.foregroundSecondary}
									className="col-span-5 capitalize"
									data-testid={'AssetsList__assetsColumn'}
								>
									{t('components.treasury.assets', { count: 1 })}
								</Label3>
								<Label3
									color={colors.foregroundSecondary}
									className="col-span-3 text-right"
									data-testid={'AssetsList__balanceColumn'}
								>
									{t('components.treasury.balance')}
								</Label3>
								<Label3
									color={colors.foregroundSecondary}
									className="col-span-2 text-right"
									data-testid={'AssetsList__priceColumn'}
								>
									{t('components.treasury.priceUsd')}
								</Label3>
								<Label3
									color={colors.foregroundSecondary}
									className="col-span-2 text-right"
									data-testid={'AssetsList__valueColumn'}
								>
									{t('components.treasury.valueUsd')}
								</Label3>
							</div>
						)}
						{list.slice(0, showItemsCount).map(({ token, amount, value, quote }) => {
							const network =
								token?.chainId !== defaultChains.MUMBAI && token?.chainId !== defaultChains.POLYGON
									? networks?.find((chain) => chain.chainId === token?.chainId)?.title
									: undefined;

							return (
								<AssetRow
									key={token?.address}
									balance={amount}
									logo={token?.iconUrl}
									decimals={token?.decimals || 18}
									rate={quote?.rate}
									value={value}
									symbol={token?.symbol}
									name={token?.name}
									network={network}
								/>
							);
						})}
						{hiddenItemsCount && <Body color={colors.foregroundTertiary}>{`+${hiddenItemsCount} more`}</Body>}
					</div>
				</div>
			)}
		</>
	);
};
