import { Trans, useTranslation } from 'next-i18next';
import { learnTierDeactivatingLink } from 'src/constants';
import { Label1 } from 'src/components/text';
import { Button } from 'src/components/button';
import { colors } from 'src/style';
import { DoneIcon, InfoOutline, toast } from 'src/components';
import { useExecuteDeleteNftTier, useSwitch } from 'src/hooks';
import { ConfirmModal } from 'src/components/modals/confirmModal';
import Tooltip from 'src/components/tooltip';

export type BuyNftProps = {
	daoAddress: string;
	tierId: string;
	collectionAddress: string;
	leftAmount: number;
	goToDaoHomePage: () => Promise<boolean>;
	isAdminRights: boolean;
};

const modalStyle = { content: { maxWidth: 400 } };

export const DeactivatedNft = (props: BuyNftProps) => {
	const { daoAddress, tierId, collectionAddress, leftAmount, goToDaoHomePage, isAdminRights } = props;
	const isDeleteAvailable = !leftAmount;

	const { t } = useTranslation();
	const [isUnableModalOpen, { on: showUnableModal, off: hideUnableModal }] = useSwitch(false);
	const [isConfirmDeleteModalOpen, { on: showConfirmDeleteModal, off: hideConfirmDeleteModal }] = useSwitch(false);
	const { mutateAsync: createAndWaitDeleteTx, isLoading } = useExecuteDeleteNftTier();

	const waitingToastId = `deleting_${tierId}`;

	const runDeleteTier = async () => {
		if (!isDeleteAvailable) {
			showUnableModal();
			return;
		}

		toast.loading(t('toasts.deleteTier.loading'), {
			position: 'bottom-center',
			id: waitingToastId,
			duration: Infinity
		});

		await createAndWaitDeleteTx(
			{
				daoAddress,
				tier: tierId,
				erc721CollectionAddress: collectionAddress
			},
			{
				onSuccess: async () => {
					await goToDaoHomePage();
					toast.success(t('toasts.deleteTier.success'), {
						position: 'bottom-center',
						icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
					});
				},
				onError: (ex) => {
					console.error(ex);
					toast.error(t('toasts.deleteTier.error'), {
						position: 'bottom-center'
					});
				},
				onSettled: () => {
					hideConfirmDeleteModal();
					toast.remove(waitingToastId);
				}
			}
		);
	};

	return (
		<div className="bg-backgroundTertiary relative mt-4 overflow-hidden rounded-[10px] p-4">
			<img
				className="absolute top-0 right-0 bottom-0 left-0 h-full w-full object-cover"
				src="/assets/deactivated.png"
			/>
			<div className="flex items-start">
				<div className="mr-2 pt-1">
					<Tooltip placement="top" content={t('pages.nft.deactivated.description')}>
						<InfoOutline fill={colors.foregroundSecondary} width={14} height={14} />
					</Tooltip>
				</div>
				<div>
					<Label1 className="text-foregroundPrimary">{t('pages.nft.deactivated.title')}</Label1>
				</div>
			</div>
			{isAdminRights ? (
				<Button
					isLoading={isLoading}
					onClick={isDeleteAvailable ? showConfirmDeleteModal : showUnableModal}
					label={t('pages.nft.deactivated.btnDelete')}
					className="mt-4 w-full"
					color="overlayTertiary"
					size="lg"
				/>
			) : null}

			<ConfirmModal
				isOpen={isUnableModalOpen}
				onClose={hideUnableModal}
				title={t('pages.nft.deactivated.notAbleToDeleteModalTitle')}
				isShowCancelBtn={false}
				modalStyle={modalStyle}
				text={
					<Trans
						i18nKey="pages.nft.deactivated.notAbleToDeleteModalText"
						components={[
							<a
								href={learnTierDeactivatingLink}
								key="0"
								target="_blank"
								rel="noreferrer"
								className="text-accentPrimary"
							/>
						]}
					/>
				}
				rightContent={
					<Button size="lg" color="accentPrimary" label={t('pages.nft.deactivated.gotIt')} onClick={hideUnableModal} />
				}
			/>
			<ConfirmModal
				isOpen={isConfirmDeleteModalOpen}
				onClose={hideConfirmDeleteModal}
				title={t('pages.editNfts.collection.tiers.removeModal.titleDeleting')}
				modalStyle={modalStyle}
				text={t('pages.editNfts.collection.tiers.removeModal.textDeleting')}
				rightContent={
					<Button
						size="lg"
						isLoading={isLoading}
						disabled={isLoading}
						color="accentNegative"
						label={t('pages.editNfts.collection.tiers.removeModal.confirmDeleting')}
						onClick={runDeleteTier}
					/>
				}
			/>
		</div>
	);
};
