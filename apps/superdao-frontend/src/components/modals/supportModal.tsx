import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

import { ExternalLinkIcon, MessageIcon } from '../assets/icons';
import { Title1, Label1, SubHeading } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent } from 'src/components/baseModal';
import { openExternal } from 'src/utils/urls';
import { colors } from 'src/style';

const modalStyles = {
	content: {
		maxWidth: '560px',
		minWidth: 'min(560px, 100vw - 24px)',
		minHeight: 0
	}
};

export const SupportModal = (props: BaseModalProps) => {
	const { isOpen, onClose } = props;

	const { t } = useTranslation();

	const handleSupportChatOpen = () => {
		openExternal('https://forms.superdao.co/get-help');
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles} withCloseIcon>
			<ModalContent withFooter={false}>
				<Title1>{t('components.supportModal.heading')}</Title1>
				<div className="-mx-4 mt-4 flex flex-wrap">
					<ListItem onClick={handleSupportChatOpen}>
						<IconWrapper>
							<MessageIcon width={20} height={20} />
						</IconWrapper>

						<ListItemContent>
							<Label1>{t('components.supportModal.title')}</Label1>
							<SubHeading color={colors.foregroundSecondary}>{t('components.supportModal.description')}</SubHeading>
						</ListItemContent>

						<ExternalLinkIcon className="mr-1.5" width={20} height={20} />
					</ListItem>
				</div>
			</ModalContent>
		</Modal>
	);
};

const IconWrapper = styled.div`
	width: 40px;
	height: 40px;

	display: flex;
	justify-content: center;
	align-items: center;

	border-radius: 50%;
	background-color: ${colors.overlayTertiary};
`;

const ListItem = styled.a`
	padding: 8px 12px;
	border-radius: 8px;
	width: 100%;

	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}
`;

const ListItemContent = styled.span`
	flex: 1;
`;
