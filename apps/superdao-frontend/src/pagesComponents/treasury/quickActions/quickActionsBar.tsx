import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { colors } from 'src/style';
import { useSwitch } from 'src/hooks';
import { TreasuryTransferNftsModal } from 'src/components/modals/treasuryTransferNftModal';
import { SendIcon, ShareIcon, StackIcon } from 'src/components';
import { ChainId } from 'src/types/types.generated';
import { CommonWalletFragment, usePublicTreasuryNftsQuery } from 'src/gql/treasury.generated';
import { QuickActionItem } from './quickActionItem';
import { TreasuryTransferFundsModal } from 'src/components/modals/treasuryTransferFundsModal';
import { TreasurySharingModal } from 'src/components/modals/treasurySharingModal';
import { CHAIN_ID_BY_NETWORK_NAME } from '@sd/superdao-shared';

type Props = {
	isLoading: boolean;
	currentUserAddress?: string;
	daoId: string;
	isQuickActionsEnabled: boolean;
	hostname: string;
	treasuryMainWallet?: CommonWalletFragment;
};

export const QuickActionsBar = (props: Props) => {
	const { isLoading, currentUserAddress, daoId, isQuickActionsEnabled, hostname, treasuryMainWallet } = props;

	const { t } = useTranslation();
	const { query } = useRouter();

	const daoUrl = `${hostname}/${query.slug}`;
	const [isTransferNftModalOpen, { off: closeTransferNftModal, on: openTransferNftModal }] = useSwitch(false);
	const [isTransferFoundsModalOpen, { off: closeTransferFoundsModal, on: openTransferFoundsModal }] = useSwitch(false);
	const [isShareModalOpen, { off: closeShareModal, on: openShareModal }] = useSwitch(false);

	const { refetch: refetchPublicNfts } = usePublicTreasuryNftsQuery({ daoId });

	return (
		<>
			{isLoading ? (
				<div></div>
			) : (
				<>
					<div className="flex animate-[fadeIn_1s_ease-in] justify-between">
						<QuickActionItem
							onClick={openTransferFoundsModal}
							icon={<SendIcon width={22} height={20} fill={colors.accentPrimary} />}
							label={t('components.treasury.quickActionsBar.transferAsset.label')}
							caption={t('components.treasury.quickActionsBar.transferAsset.caption')}
							itemClassName="ml-0"
						/>
						<QuickActionItem
							onClick={openShareModal}
							icon={<ShareIcon width={18} height={22} fill={colors.accentPrimary} />}
							label={t('components.treasury.quickActionsBar.shareTreasury.label')}
							caption={t('components.treasury.quickActionsBar.shareTreasury.caption')}
						/>
						<QuickActionItem
							onClick={openTransferNftModal}
							icon={<StackIcon width={20} height={22} fill={colors.accentPrimary} />}
							label={t('components.treasury.quickActionsBar.transferNft.label')}
							caption={t('components.treasury.quickActionsBar.transferNft.caption')}
							itemClassName="mr-0"
						/>
					</div>
					{isTransferNftModalOpen && currentUserAddress && (
						<TreasuryTransferNftsModal
							isOpen={isTransferNftModalOpen}
							onClose={closeTransferNftModal}
							senderAddress={currentUserAddress}
							isQuickActionsEnabled={isQuickActionsEnabled}
							{...{
								refetchList: refetchPublicNfts,
								daoId,
								chainId: ChainId.PolygonMainnet
							}}
						/>
					)}
					{isTransferFoundsModalOpen && currentUserAddress && (
						<TreasuryTransferFundsModal
							isOpen={isTransferFoundsModalOpen}
							onClose={closeTransferFoundsModal}
							senderAddress={currentUserAddress}
							initialValue={null}
							isQuickActionsEnabled={isQuickActionsEnabled}
							{...{
								daoId,
								chainId: CHAIN_ID_BY_NETWORK_NAME[ChainId.PolygonMainnet]
							}}
						/>
					)}
					{isShareModalOpen && currentUserAddress && (
						<TreasurySharingModal
							isOpen={isShareModalOpen}
							onClose={closeShareModal}
							daoUrl={daoUrl}
							daoWalletAddress={treasuryMainWallet?.address}
							{...{
								daoId,
								chainId: ChainId.PolygonMainnet
							}}
						/>
					)}
				</>
			)}
		</>
	);
};
