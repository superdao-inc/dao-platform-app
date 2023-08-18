import { useTranslation } from 'next-i18next';
import { memo, useCallback, useState } from 'react';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { Body, Caption, Title1, Title2 } from 'src/components/text';
import { UserNotificationsFragment } from 'src/gql/userNotification.generated';
import { CommonEnrichedNftFragment } from 'src/gql/nft.generated';
import { Avatar } from 'src/components/common/avatar';
import { Button } from 'src/components/button';
import { HowToNftButton } from 'src/components/howToNftButton';
import { useToggleNotificationMutation } from 'src/gql/notification.generated';

const modalStyles = {
	content: {
		minWidth: 400,
		width: 400,
		minHeight: 640
	}
};

const transparentModalStyles = {
	content: {
		minWidth: 400,
		width: 400,
		minHeight: 640,
		boxShadow: 'none'
	},
	overlay: {
		background: 'transparent'
	}
};

type UserProfileNotificationProps = {
	userNfts: CommonEnrichedNftFragment[];
	nftNotifications: UserNotificationsFragment[];
};

const UserProfileNotification = (props: UserProfileNotificationProps) => {
	const { userNfts, nftNotifications } = props;

	const { t } = useTranslation();

	const { mutate: toggleNotification } = useToggleNotificationMutation();

	const [closeModal, setCloseModal] = useState<boolean[]>([]);

	const handleCloseModal = useCallback(
		(index: number, id: string) => {
			toggleNotification({ notificationId: id });

			setCloseModal((prevShowModal) => {
				const newCloseModal = [...prevShowModal];
				newCloseModal[index] = true;
				return newCloseModal;
			});
		},
		[toggleNotification]
	);

	return (
		<>
			{nftNotifications.map((notification, i) => {
				const { id, newNftData } = notification;
				const nft = userNfts.find((n) => n.tokenId === newNftData?.id);
				if (!nft) return null;

				const {
					metadata,
					name,
					dao: { id: daoId, name: daoName, avatar }
				} = nft;

				const styles = i !== 0 ? transparentModalStyles : modalStyles;
				const onClose = () => handleCloseModal(i, id);
				const { image, attributes } = metadata || {};
				const tier = attributes?.find((a) => a.traitType === 'tier')?.value;

				return (
					<Modal style={styles} key={id} isOpen={!closeModal[i]} onClose={onClose}>
						<ModalContent>
							<Title1>{t('modals.nft.newNft.title')}</Title1>

							<div className="flex flex-col items-center">
								<img alt="nft image" className="mt-7 rounded-lg" src={image ?? ''} width={350} height={355} />

								<Title2 className="mt-6">{name}</Title2>

								{tier ? <Body className="text-foregroundSecondary mt-2 break-all text-center">{tier}</Body> : null}

								<div className="mt-2 flex items-center gap-2">
									<Avatar size="xs" seed={daoId} fileId={avatar!} />
									<Caption>{daoName}</Caption>
								</div>
							</div>
						</ModalContent>
						<ModalFooter
							left={<HowToNftButton />}
							right={<Button color="accentPrimary" size="lg" label={t('modals.nft.newNft.yay')} onClick={onClose} />}
						/>
					</Modal>
				);
			})}

			{/* Other notification: */}
			<div />
		</>
	);
};

export default memo(UserProfileNotification);
