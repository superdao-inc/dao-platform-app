import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

import { Modal, ModalContent } from 'src/components/baseModal';
import { Title1, Body, Cell, FileIcon, PlusIcon } from 'src/components';
import { colors } from 'src/style';

const modalStyles = {
	content: { width: 'min(400px, calc(100vw - 36px))', minWidth: 'min(320px, calc(100vw - 36px))' }
};

interface Props {
	isOpen: boolean;
	onManualSelected: () => void;
	onImportSelected: () => void;
	onCancel: () => void;
	title?: string;
	description?: string;
	importCsvLabel?: string;
	importCsvDescription?: string;
	manualLabel?: string;
	manualDescription?: string;
}

export const UploadInterlayerModal = (props: Props) => {
	const { isOpen, onManualSelected, onImportSelected, onCancel, ...labels } = props;

	const { title, description, importCsvLabel, importCsvDescription, manualLabel, manualDescription } = labels;

	const { t } = useTranslation();

	return (
		<Modal withCloseIcon onClose={onCancel} isOpen={isOpen} style={modalStyles}>
			<ModalContent className="!px-3" withFooter={false}>
				<div className="pl-3">
					<Title1>{title ?? t('pages.importMembers.modal.interlayer.airdropHeading')}</Title1>
					<StyledBody>
						{description ?? t('pages.importMembers.modal.interlayer.airdropDescriptionWalletsOrEmails')}
					</StyledBody>
				</div>
				<StyledCell
					sidesPadding={{
						left: 12,
						right: 12
					}}
					onClick={onImportSelected}
					size="auto"
					before={
						<StyledMemberIconWrapper>
							<FileIcon width={18} height={21} />
						</StyledMemberIconWrapper>
					}
					label={importCsvLabel ?? t('pages.importMembers.modal.interlayer.importCsv')}
					description={importCsvDescription ?? t('pages.importMembers.modal.interlayer.importCsvDescription')}
				/>
				<StyledCell
					sidesPadding={{
						left: 12,
						right: 12
					}}
					onClick={onManualSelected}
					size="auto"
					before={
						<StyledMemberIconWrapper>
							<PlusIcon width={20} height={20} />
						</StyledMemberIconWrapper>
					}
					label={manualLabel ?? t('pages.importMembers.modal.interlayer.addManually')}
					description={manualDescription ?? t('pages.importMembers.modal.interlayer.addManuallyDescription')}
				/>
			</ModalContent>
		</Modal>
	);
};

const StyledMemberIconWrapper = styled.div`
	display: inline-flex;
	padding: 8px;
	background-color: ${colors.overlayTertiary};
	border-radius: 50%;
	width: 40px;
	height: 40px;
	align-items: center;
	justify-content: center;
`;

const StyledBody = styled(Body)`
	margin-top: 8px;
	margin-bottom: 12px;
`;

const StyledCell = styled(Cell)`
	padding: 0;
	color: white;
	transition: 0.3s;
	border-radius: 8px;

	& > div {
		cursor: pointer;
	}

	&:hover {
		background-color: ${colors.overlaySecondary};
		transition: 0.3s;
	}
`;
