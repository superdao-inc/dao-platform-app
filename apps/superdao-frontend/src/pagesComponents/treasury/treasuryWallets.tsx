import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { getAddress } from '@sd/superdao-shared';
import { ChevronRight, Label1, PlusIcon, SubHeading, Title3 } from 'src/components';
import { CommonWalletFragment } from 'src/gql/treasury.generated';
import { colors } from 'src/style';
import { SkeletonWallets, SkeletonWalletsBlock } from './skeletonWallets';
import { TreasuryWallet } from './treasuryWallet';

type Props = {
	wallets: CommonWalletFragment[];
	slug: string;
	daoId: string;
	isLoading: boolean;
	isPage?: boolean;
	isCreator: boolean;
	isQuickActionsEnabled?: boolean;
	currentUserAddress?: string;
	isMember?: boolean;
};

const SHOW_ITEMS_COUNT = 3;

export const TreasuryWallets: React.VFC<Props> = (props) => {
	const { wallets, slug, daoId, isLoading, isPage, isCreator, isQuickActionsEnabled, isMember, currentUserAddress } =
		props;
	const { t } = useTranslation();
	const { push, asPath } = useRouter();
	const handleGoToWallets = () => push(`/${slug}/treasury/wallets`);
	const handleOpenWalletCreationPage = () => push(`/${slug}/treasury/wallets/create?from=${asPath}`);
	const showChevron = isQuickActionsEnabled && wallets.length > SHOW_ITEMS_COUNT;
	const visibleWalletsCount = isQuickActionsEnabled && !isPage ? SHOW_ITEMS_COUNT : wallets.length;
	const SkeletonComponent = useMemo(() => (isPage ? SkeletonWallets : SkeletonWalletsBlock), [isPage]);
	const TitleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
		showChevron ? <button onClick={handleGoToWallets}>{children}</button> : <>{children}</>;
	return isLoading ? (
		<SkeletonComponent />
	) : (
		<div
			className="bg-backgroundSecondary mb-5 flex flex-col rounded-lg py-5 px-6"
			data-testid={'TreasuryWallets__wrapper'}
		>
			<div className="animate-[fadeIn_1s_ease-in]">
				{!isPage && (
					<div className="mb-4 flex justify-between">
						<TitleWrapper>
							<div className="align-center flex gap-2">
								<Title3 className="capitalize" data-testid={'TreasuryWallets__title'}>
									{t('components.treasury.wallets_other')}
								</Title3>
								<Title3 color={colors.foregroundTertiary} data-testid={'TreasuryWallets__allWalletsButton'}>
									{wallets && wallets.length}
								</Title3>
								{showChevron && (
									<ChevronRight width={16} height={16} fill={colors.foregroundTertiary} className="mt-1.5" />
								)}
							</div>
						</TitleWrapper>

						{(isMember || isCreator) && (
							<Label1
								onClick={handleOpenWalletCreationPage}
								className="text-accentPrimary hover:text-accentPrimaryHover cursor-pointer"
								data-testid={'TreasuryWallets__addWalletButton'}
							>
								{t('components.treasury.addWalletBtn')}
							</Label1>
						)}
					</div>
				)}
				<div className="flex flex-col">
					{wallets &&
						wallets.slice(0, visibleWalletsCount).map((wallet) => {
							const isUserWallet = getAddress(currentUserAddress) === getAddress(wallet.address);
							const isWalletEditable = (isCreator && !wallet.main) || isUserWallet;

							return (
								<TreasuryWallet
									key={wallet.id}
									wallet={wallet}
									slug={slug}
									isEditable={isWalletEditable}
									daoId={daoId}
								/>
							);
						})}
				</div>
				{isPage && isMember && (
					<div className="flex cursor-pointer pt-4" onClick={handleOpenWalletCreationPage}>
						<div className="bg-overlayTertiary mr-4 flex h-[40px] w-[40px] items-center justify-center rounded-full p-2">
							<PlusIcon width={20} height={20} fill={colors.foregroundSecondary} />
						</div>
						<div>
							<Label1>{t('components.treasury.addWalletBtn')}</Label1>
							<SubHeading color={colors.foregroundSecondary}>
								{t('components.treasury.createWallet.connectWallet.addManually.description')}
							</SubHeading>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
