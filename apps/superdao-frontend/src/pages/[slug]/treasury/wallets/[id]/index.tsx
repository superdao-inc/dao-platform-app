import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import truncate from 'lodash/truncate';
import { getAddress, CHAIN_ID_BY_NETWORK_NAME, FEATURES } from '@sd/superdao-shared';

import { SkeletonNftsBlock } from 'src/pagesComponents/treasury/wallet/skeletonNfts';
import { TreasuryWalletType, Wallet } from 'src/types/types.generated';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { usePublicTreasuryNftsQuery, useTreasuryQuery } from 'src/gql/treasury.generated';
import { useDaoMembersQuery } from 'src/gql/daoMembership.generated';
import { getCurrentUserAsMember, getDaoWithRoles, getUserByIdOrSlug } from 'src/client/commonRequests';
import { useSwitch } from 'src/hooks';
import {
	PageContent,
	WalletGreetingsModal,
	CommunityIcon,
	Button,
	Label2,
	DropdownMenu,
	TrashIcon,
	SettingsIcon,
	PolygonScanIcon,
	EthereumFilledIcon,
	BinanceSmartChainFilledIcon
} from 'src/components';
import { Dashboard } from 'src/pagesComponents/treasury/wallet/dashboard';
import { AssetsList } from 'src/pagesComponents/treasury/assetsList';
import { TransactionsList } from 'src/pagesComponents/treasury/wallet/transactionsList';
import { Header, Name } from 'src/pagesComponents/common/header';
import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user/API';
import { DaoMemberZone } from 'src/pagesComponents/dao/daoMemberZone';
import {
	TreasuryTransferFundsModal,
	TreasuryTransferFundsModalContext,
	TreasuryTransferFundsModalInitialValue
} from 'src/components/modals/treasuryTransferFundsModal';
import { CustomHead } from 'src/components/head';
import { CustomSelect } from 'src/components';
import { colors } from 'src/style';
import { CheckboxOption, SelectProps, customNetworkSelectStyles } from 'src/pagesComponents/treasury/networkSelect';
import { SkeletonAssetsBlock } from 'src/pagesComponents/treasury/skeletonAssets';
import { SkeletonDashboard } from 'src/pagesComponents/treasury/wallet/skeletonDashboard';
import { SkeletonPage } from 'src/pagesComponents/treasury/wallet/skeletonPage';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import {
	useWalletQuery,
	useWalletTransactionsQuery,
	useGetBalanceQuery,
	useWalletsNameQuery
} from 'src/gql/wallet.generated';
import { useChangeNftsVisibilityMutation, useGetWalletNftsQuery } from 'src/gql/walletNfts.generated';
import { RemoveWalletModal } from 'src/components/modals/removeWalletModal';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { Star } from 'src/components/assets/icons/star';
import { isAdmin } from 'src/utils/roles';
import { WalletNftsList } from 'src/pagesComponents/treasury/wallet/walletNftsList';
import { featureToggles } from 'src/server/featureToggles.service';

//TODO move networks service to shared and use here
const selectOptions: SelectProps[] = [
	{
		value: '0',
		label: (
			<div className="my-[-2px] flex">
				<CommunityIcon className="my-auto mr-2" width={16} height={16} />
				<Label2>All networks</Label2>
			</div>
		)
	},
	{
		value: CHAIN_ID_BY_NETWORK_NAME.POLYGON_MAINNET,
		label: (
			<div className="ml-[-1.5px] flex">
				<PolygonScanIcon className="my-auto mr-2" width={18} height={18} />
				<Label2>Polygon</Label2>
			</div>
		)
	},
	{
		value: CHAIN_ID_BY_NETWORK_NAME.ETHEREUM_MAINNET,
		label: (
			<div className="flex">
				<EthereumFilledIcon className="my-auto mr-2" width={16} height={16} fill={colors.foregroundPrimary} />
				<Label2>Ethereum</Label2>
			</div>
		)
	},
	{
		value: CHAIN_ID_BY_NETWORK_NAME.BINANCE_SMART_CHAIN_MAINNET,
		label: (
			<div className="flex">
				<BinanceSmartChainFilledIcon className="my-auto mr-2" width={16} height={16} />
				<Label2>Binance Smart Chain</Label2>
			</div>
		)
	}
];

type Props = {
	id: string;
	slug: string;
	daoId: string;
	data: Wallet[];
	totalAmount: string;
	isCreator: boolean;
	currentUserAddress?: string;
	isNftTransferEnabled: boolean;
	isWalletNftsServiceEnabled: boolean;
	isQuickActionsEnabled: boolean;
	isTreasuryBSCSupportEnabled: boolean;
};

const WalletPage: NextPageWithLayout<Props> = (props) => {
	const {
		slug,
		id,
		isCreator,
		currentUserAddress,
		daoId,
		isNftTransferEnabled,
		isWalletNftsServiceEnabled,
		isQuickActionsEnabled,
		isTreasuryBSCSupportEnabled
	} = props;

	const { query, push, replace } = useRouter();
	const queryClient = useQueryClient();
	const { t } = useTranslation();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { data: walletData, isLoading: isWalletMetaLoading } = useWalletQuery({ id });
	const [
		isTreasuryTransferFundsModalOpen,
		{ off: closeTreasuryTransferFundsModal, on: openTreasuryTransferFundsModal }
	] = useSwitch(false);

	const { data: daoMemberData } = useDaoMembersQuery({ daoId, roles: null });
	const { data: walletsNameData } = useWalletsNameQuery({ daoId });
	const { data: lastSelectedNetwork, setData: setStorageData } = useLocalStorage(
		`network_${getAddress(walletData?.wallet.address)}`
	);

	const { data: publicTreasuryNfts = [], refetch: refetchPublicTreasuryNfts } = usePublicTreasuryNftsQuery(
		{ daoId },
		{
			keepPreviousData: true,
			select: (data) => data.treasury?.nfts,
			cacheTime: 0
		}
	);

	const [treasuryTransferFundsModalValue, setTreasuryTransferFundsModal] =
		useState<TreasuryTransferFundsModalInitialValue | null>(null);

	const memoizedContextValue = useMemo(
		() => ({
			isOpen: isTreasuryTransferFundsModalOpen,
			on: (initValue: TreasuryTransferFundsModalInitialValue) => {
				setTreasuryTransferFundsModal(initValue);
				openTreasuryTransferFundsModal();
			},
			off: () => {
				setTreasuryTransferFundsModal(null);
				closeTreasuryTransferFundsModal();
			}
		}),
		[closeTreasuryTransferFundsModal, isTreasuryTransferFundsModalOpen, openTreasuryTransferFundsModal]
	);
	const [isRemoveModalOpen, setRemoveModalIsOpen] = useState(false);
	const { daoBySlug: daoData } = data || {};

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: memberRoleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });
	const { currentUserMemberRole } = memberRoleData || {};

	const [isCreatedModalVisible, { off: closeCreatedModal }] = useSwitch(Boolean(query.isNew));

	const handleCloseCreatedModal = () => {
		replace(window.location.pathname);
		closeCreatedModal();
	};
	const [value, onNetworkChange] = useState('');

	const onSelectedNetworkChange = (value: string) => {
		onNetworkChange(value);
		setStorageData(value);
	};
	const selectedNetwork = Number(value) || Number(lastSelectedNetwork) || null;
	const currentNetwork = walletData?.wallet.chainId
		? Number(CHAIN_ID_BY_NETWORK_NAME[walletData?.wallet.chainId])
		: selectedNetwork;

	const { data: balanceData, isLoading: isAssetsLoading } = useGetBalanceQuery(
		{
			address: walletData?.wallet.address!,
			chainId: currentNetwork
		},
		{ enabled: Boolean(walletData?.wallet.address) }
	);

	const {
		data: nftsData,
		isLoading: isNftsLoading,
		refetch: refetchNfts
	} = useGetWalletNftsQuery(
		{
			walletId: walletData?.wallet.id!,
			chainId: currentNetwork
		},
		{ enabled: Boolean(walletData?.wallet.id) }
	);

	const { data: txsData, isLoading: isTxsLoading } = useWalletTransactionsQuery(
		{
			addresses: [walletData?.wallet.address!],
			chainId: currentNetwork
		},
		{ enabled: Boolean(walletData?.wallet.address), cacheTime: 0 }
	);

	const { mutate } = useChangeNftsVisibilityMutation({});
	const changeNftVisibility = (id: string, isPublic: boolean) => {
		mutate(
			{ nftsIds: [id], isPublic, daoId },
			{
				onSuccess: () => {
					refetchNfts();
					refetchPublicTreasuryNfts();
				}
			}
		);
	};

	const assets = !balanceData ? [] : balanceData.getBalance;

	const transactions = txsData?.walletTransactions.items || [];

	const handleBack = () => {
		queryClient.refetchQueries(useTreasuryQuery.getKey({ daoId }));
		push(`/${slug}/treasury`);
	};

	const isCurrentUserWalletOwner = useMemo(() => {
		if (!currentUserAddress || !walletData || !walletData.wallet.owners) return false;
		const { owners } = walletData.wallet;

		const currentUserOwner = owners.find((owner) => {
			return getAddress(owner.walletAddress) === getAddress(currentUserAddress);
		});

		return !!currentUserOwner;
	}, [currentUserAddress, walletData]);

	if (!daoData) return null;

	if (!currentUserMemberRole || !isAuthorized) {
		return (
			<PageContent>
				<div className="mt-[72px]">
					<DaoMemberZone isAuthorized={isAuthorized} whitelistUrl={daoData.whitelistUrl} />
				</div>
			</PageContent>
		);
	}

	if (!walletData) {
		return (
			<PageContent onBack={handleBack}>
				<CustomHead
					main={daoData?.name ? daoData?.name : `Wallet`}
					additional={daoData?.name ? `Wallet` : 'Superdao'}
					description={daoData?.description ?? ''}
					avatar={daoData?.avatar ?? null}
				/>

				<Name className="mb-6 capitalize">{t('components.treasury.wallets', { count: 1 })}</Name>
				<SkeletonPage />
			</PageContent>
		);
	}

	const { type, name, description, address, chainId, main } = walletData.wallet;
	const valueUsd = balanceData?.getBalance.reduce((acc, token) => acc + token.valueUsd, 0);
	const walletChain = chainId ? CHAIN_ID_BY_NETWORK_NAME[chainId] : null;
	const isEditable = !main && isCreator;

	const nfts = !nftsData?.getWalletNfts
		? []
		: nftsData.getWalletNfts.map((nft) => ({
				...nft,
				walletName: name,
				chainId,
				walletType: type
		  }));

	const hasNfts = nfts.length > 0;
	const handleOpenTreasuryTransferFundsModal = () => openTreasuryTransferFundsModal();

	const openWalletEditPage = () => push(`/${slug}/treasury/wallets/${id}/edit`);

	const availableSelectOptions = !isTreasuryBSCSupportEnabled
		? selectOptions.filter((option) => option.value !== CHAIN_ID_BY_NETWORK_NAME.BINANCE_SMART_CHAIN_MAINNET)
		: selectOptions;

	return (
		<TreasuryTransferFundsModalContext.Provider value={memoizedContextValue}>
			<PageContent onBack={handleBack}>
				<CustomHead
					main={daoData.name}
					additional={`Wallet ${walletData.wallet.name}`}
					description={daoData.description}
					avatar={daoData.avatar}
				/>

				<WalletGreetingsModal isOpen={isCreatedModalVisible} onClose={handleCloseCreatedModal} />

				<Header className="pt-0 pb-6">
					<div className="flex items-center">
						<Name>{truncate(name, { length: 20 })}</Name>
						{main && (
							<div className="bg-accentPrimary/20 ml-2 rounded-full p-1.5">
								<Star width={12} height={12} starcolor="#FC7900" />
							</div>
						)}
					</div>
					<div className="flex items-center gap-5">
						<CustomSelect
							styles={customNetworkSelectStyles}
							defaultValue={
								chainId ? availableSelectOptions.find((item) => item.value === walletChain) : availableSelectOptions[0]
							}
							placeholder={t('pages.dao.addMembersManually.actions.select')}
							onChange={({ value: newValue }) => onSelectedNetworkChange(newValue?.value ?? '')}
							components={{ Option: CheckboxOption }}
							value={
								availableSelectOptions.find((item) => item.value === value) ||
								availableSelectOptions.find((item) => item.value === lastSelectedNetwork)
							}
							options={availableSelectOptions}
							defaultMenuIsOpen={true}
							isDisabled={Boolean(chainId)}
						/>
						{type === TreasuryWalletType.Safe && (
							<Button
								size="md"
								color="accentPrimary"
								label={t('components.treasury.transfer')}
								disabled={!isCurrentUserWalletOwner}
								onClick={handleOpenTreasuryTransferFundsModal}
							/>
						)}
						{isEditable && (
							<div className="pt-1.5">
								<DropdownMenu
									options={[
										{
											label: t('components.treasury.settingsDropdown.settings'),
											before: <SettingsIcon width={22} height={22} fill={colors.foregroundSecondary} />,
											onClick: openWalletEditPage
										},
										{
											label: t('components.treasury.settingsDropdown.remove'),
											color: colors.accentNegative,
											before: <TrashIcon width={22} height={22} fill={colors.accentNegative} />,
											onClick: () => setRemoveModalIsOpen(true)
										}
									]}
								/>
							</div>
						)}
					</div>
				</Header>
				{isWalletMetaLoading ? (
					<SkeletonDashboard />
				) : (
					<Dashboard
						chainId={currentNetwork}
						valueUsd={valueUsd}
						description={description}
						address={address}
						type={type}
						isValueLoading={isAssetsLoading}
					/>
				)}
				{/* {owners && <OwnersList owners={owners} />} */}

				{assets.length !== 0 ? (
					isAssetsLoading ? (
						<SkeletonAssetsBlock />
					) : (
						<AssetsList list={assets.sort((a, b) => Number(b.value) - Number(a.value)) || []} withTitle={true} />
					)
				) : (
					<></>
				)}

				{hasNfts ? (
					isNftsLoading ? (
						<SkeletonNftsBlock />
					) : (
						<WalletNftsList
							showChangeVisibilityOption={isAdmin(currentUserMemberRole) && isWalletNftsServiceEnabled}
							onChangeNftVisibility={changeNftVisibility}
							isNftTransferEnabled={isNftTransferEnabled}
							publicTreasuryNftsCount={publicTreasuryNfts.length || 0}
							{...{ isQuickActionsEnabled, currentNetwork, refetchNfts, currentUserAddress, isCreator, nfts }}
						/>
					)
				) : (
					<></>
				)}

				{transactions.length !== 0 ? (
					<TransactionsList
						transactions={txsData?.walletTransactions.items || []}
						isCreator={isCreator}
						daoMembers={daoMemberData?.daoMembers.items || []}
						walletsName={walletsNameData?.walletsName || []}
						chainId={currentNetwork}
						isLoading={isTxsLoading}
					/>
				) : (
					<></>
				)}

				{memoizedContextValue.isOpen && currentUserAddress && isCurrentUserWalletOwner && walletChain && (
					<TreasuryTransferFundsModal
						isOpen={memoizedContextValue.isOpen}
						onClose={memoizedContextValue.off}
						wallet={walletData.wallet}
						initialValue={treasuryTransferFundsModalValue}
						senderAddress={currentUserAddress}
						chainId={walletChain}
						{...{ isQuickActionsEnabled }}
					/>
				)}
				<RemoveWalletModal
					isOpen={isRemoveModalOpen}
					onClose={() => setRemoveModalIsOpen(false)}
					id={walletData.wallet.id}
					address={walletData.wallet.address}
					slug={slug}
					daoId={daoId}
					isWalletPage={true}
				/>
			</PageContent>
		</TreasuryTransferFundsModalContext.Provider>
	);
};

WalletPage.getLayout = getDaoLayout;

export default WalletPage;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	const id = ctx.params?.id;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: userID });

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	const isNftTransferEnabled = featureToggles.isEnabled('treasury_nft_transfer');
	const isWalletNftsServiceEnabled = featureToggles.isEnabled('treasury_use_nfts_service');
	const isQuickActionsEnabled = featureToggles.isEnabled('treasury_quick_actions_bar');
	const isTreasuryBSCSupportEnabled = featureToggles.isEnabled(FEATURES.TREASURY_BSC_SUPPORT);

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			id,
			isCreator: isAdmin(userAsMember?.role),
			currentUserAddress: userByIdOrSlug?.walletAddress,
			isNftTransferEnabled,
			isWalletNftsServiceEnabled,
			isQuickActionsEnabled,
			isTreasuryBSCSupportEnabled,
			...getProps()
		}
	};
});
