import { Trans, useTranslation } from 'next-i18next';
import React, { useMemo, useState } from 'react';
import { learnTierDeactivatingLink } from 'src/constants';
import { Button } from 'src/components';
import { modalCloseTimeoutMS } from 'src/components/baseModal';
import { ConfirmModal } from 'src/components/modals/confirmModal';
import { useSwitch } from 'src/hooks';
import { ExtendedNftTier } from 'src/types/types.generated';
import { confirmDeleteModalStyle } from 'src/pagesComponents/dao/nftEdit/constants';

const getModalWording = (t: Function, mintedNfts: number = 0) =>
	mintedNfts > 0
		? {
				title: t('pages.editNfts.collection.tiers.removeModal.titleDeactivating'),
				text: (
					<Trans
						i18nKey="pages.editNfts.collection.tiers.removeModal.textDeactivating"
						values={{ count: mintedNfts }}
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
				),
				buttonLabel: t('pages.editNfts.collection.tiers.removeModal.confirmDeactivating')
		  }
		: {
				title: t('pages.editNfts.collection.tiers.removeModal.titleDeleting'),
				text: t('pages.editNfts.collection.tiers.removeModal.textDeleting'),
				buttonLabel: t('pages.editNfts.collection.tiers.removeModal.confirmDeleting')
		  };

interface ChildrenParams {
	onRemoveTierClick: (tier: ExtendedNftTier, idx: number) => (event: React.MouseEvent) => void;
}

type Props = {
	onRemoveItemClick: (idx: number) => void;
	children: (params: ChildrenParams) => any;
};

export const RemoveTierModalWrapper: React.FC<Props> = (props) => {
	const { onRemoveItemClick, children } = props;

	const { t } = useTranslation();

	const [isConfirmModalShown, { on: showConfirmModal, off: hideConfirmDeleteModal }] = useSwitch(false);

	const [deletingTier, setTierForDeleteConfirm] = useState<{
		index: number;
		mintedNfts: number;
	}>();

	const modal = useMemo(() => getModalWording(t, deletingTier?.mintedNfts), [deletingTier, t]);

	const handlerRemoveClick = (tier: ExtendedNftTier, idx: number) => (event: React.MouseEvent) => {
		event.stopPropagation();
		setTierForDeleteConfirm({
			index: idx,
			mintedNfts: tier.totalAmount
		});
		showConfirmModal();
	};

	const closeModalAfterDelay = () => {
		hideConfirmDeleteModal();
		setTimeout(setTierForDeleteConfirm, modalCloseTimeoutMS); // Prevent text flickering while modal closing
	};

	const handleConfirmRemove = () => {
		onRemoveItemClick(deletingTier!.index);
		closeModalAfterDelay();
	};

	return (
		<>
			{children({
				onRemoveTierClick: handlerRemoveClick
			})}

			<ConfirmModal
				modalStyle={confirmDeleteModalStyle}
				isOpen={isConfirmModalShown}
				onClose={closeModalAfterDelay}
				title={modal.title}
				text={modal.text}
				rightContent={
					<Button
						size="lg"
						color="accentNegative"
						label={modal.buttonLabel}
						onClick={handleConfirmRemove}
						data-testid="RemoveTierModalWrapper__confirmBtn"
					/>
				}
			/>
		</>
	);
};
