import { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';

import { TreasuryWallets } from 'src/pagesComponents/treasury/treasuryWallets';
import { PublicTreasuryQuery, TreasuryQuery, CommonWalletFragment } from 'src/gql/treasury.generated';
import { TreasuryDashboard } from 'src/pagesComponents/treasury/treasuryDashboard';
import { QuickActionsBar } from './quickActions/quickActionsBar';
import { EmptyState } from 'src/pagesComponents/treasury/emptyState';
import { AssetsList } from 'src/pagesComponents/treasury/assetsList';
import { NftsList } from './nftsList';
import { DaoMemberRole } from 'src/types/types.generated';
import { isAdmin } from 'src/utils/roles';
import { getAddress } from '@sd/superdao-shared';
import { MobileTxs } from './mobileTxs';

type Props = {
	slug: string;
	daoId: string;
	contractAddress: string | null;
	isCreator: boolean;
	currentUserAddress?: string;
	isWalletNftsServiceEnabled?: boolean;
	onChangeNftVisibility?: (id: string, isPublic: boolean) => void;
	isQuickActionsEnabled: boolean;
	hostname: string;
};

export const TreasuryBaseComponent = (
	props: Props & {
		daoName?: string;
		isLoading: boolean;
		isError: boolean;
		treasuryData: PublicTreasuryQuery | TreasuryQuery | undefined;
		privateWallets?: CommonWalletFragment[];
		currentUserMemberRole?: DaoMemberRole;
		refetch?: () => void;
		isNftTransferEnabled: boolean;
		daoUrl?: string;
		isMobile: boolean;
	}
) => {
	const {
		daoName,
		isLoading,
		isError,
		treasuryData,
		slug,
		isCreator,
		contractAddress,
		daoId,
		privateWallets,
		currentUserMemberRole,
		currentUserAddress,
		isNftTransferEnabled,
		isWalletNftsServiceEnabled,
		isQuickActionsEnabled,
		refetch,
		onChangeNftVisibility,
		hostname,
		isMobile
	} = props;
	const { t } = useTranslation();

	const wallets = useMemo(() => {
		return treasuryData?.treasury?.wallets || [];
	}, [treasuryData]);

	const valueUsd = useMemo(() => {
		return wallets?.reduce((acc, wallet) => acc + wallet.valueUsd, 0) || 0;
	}, [wallets]);

	const treasuryMainWallet = privateWallets?.find((wallet) => wallet.main);

	// TODO ref this
	const walletsTokens = wallets.flatMap((wallet) => wallet.tokensBalance.map((tokenBalance) => tokenBalance));
	const uniqueTokens = uniqBy(walletsTokens, 'token.address').map(({ token: { iconUrl } }) => iconUrl);

	const publicWalletsNfts =
		treasuryData?.treasury?.nfts
			.filter((nft) => nft.isPublic)
			.map((nft) => {
				const wallet = privateWallets?.find(({ address }) => getAddress(address) === getAddress(nft.ownerOf));
				return wallet ? { ...nft, walletName: wallet.name, chainId: wallet.chainId, walletType: wallet.type } : nft;
			}) || [];

	const tokens = treasuryData?.treasury?.assets || [];
	const isMember = currentUserMemberRole === DaoMemberRole.Member;

	const shouldSeeWalletsSection = !isMobile && ((isMember && privateWallets && privateWallets.length > 0) || isCreator);
	const showChangePublicNftVisibilityOption = isAdmin(currentUserMemberRole) && isWalletNftsServiceEnabled;

	return (
		<>
			{isEmpty(wallets) && !isLoading && !isError ? (
				<EmptyState name={daoName} slug={slug} isCreator={isCreator} isMobile={isMobile} />
			) : (
				<>
					<TreasuryDashboard
						assets={uniqueTokens}
						{...{
							isLoading,
							valueUsd,
							contractAddress,
							daoId,
							isQuickActionsEnabled,
							isMobile
						}}
					/>
					{isAdmin(currentUserMemberRole) && isQuickActionsEnabled && !isMobile && (
						<QuickActionsBar
							{...{
								isLoading,
								currentUserAddress,
								daoId,
								isQuickActionsEnabled,
								hostname,
								treasuryMainWallet
							}}
						/>
					)}
					{shouldSeeWalletsSection && (
						<TreasuryWallets
							wallets={privateWallets || []}
							slug={slug}
							daoId={daoId}
							isLoading={isLoading}
							isCreator={isCreator}
							isQuickActionsEnabled={isQuickActionsEnabled}
							isMember={isMember}
							currentUserAddress={currentUserAddress}
						/>
					)}

					<AssetsList
						list={tokens}
						maxItems={4}
						withTitle={true}
						{...{
							isMobile,
							isLoading,
							isQuickActionsEnabled
						}}
					/>

					{isMobile && <MobileTxs {...{ slug, daoId }} />}

					<NftsList
						maxItems={6}
						nfts={publicWalletsNfts || []}
						refetchList={refetch}
						listTitle={{ name: t('components.treasury.nfts_title.public_nfts'), count: publicWalletsNfts.length }}
						{...{
							isLoading,
							isCreator,
							currentUserAddress,
							isNftTransferEnabled,
							onChangeNftVisibility,
							showChangeVisibilityOption: showChangePublicNftVisibilityOption,
							isQuickActionsEnabled,
							isMobile,
							slug
						}}
					/>
				</>
			)}
		</>
	);
};
