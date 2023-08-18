import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { Modal, ModalContent, ModalFooter } from './baseModal';
import { Button } from './button';
import { Title1, Body, Label1 } from './text';
import { colors } from 'src/style';
import { AirdropParticipantType } from 'src/pagesComponents/membersImport/types';

const modalStyles = { content: { width: '100%', maxWidth: 418, minWidth: 'min(320px, calc(100vw - 36px))' } };

type ErrorHintProps = {
	errors: CSVErrors;
	onClose: () => void;
};

export interface CSVErrors {
	emailsLines: AirdropParticipantType[];
	walletsLines: AirdropParticipantType[];
}

export const ErrorHintModal = (props: ErrorHintProps) => {
	const { errors, onClose } = props;

	const { t } = useTranslation();

	return (
		<Modal isOpen style={modalStyles}>
			<ModalContent>
				<StyledTitle1>{t('pages.importMembers.modal.errorsModal.heading')}</StyledTitle1>
				<StyledBody>{t('pages.importMembers.modal.description')}</StyledBody>

				{!!errors.emailsLines.length && (
					<ErrorSection>
						<StyledLabel>{t('pages.importMembers.modal.errorsModal.emailsHeading')}</StyledLabel>
						<ErrorSectionContent>
							{errors.emailsLines.map((emailLine, index) => (
								// eslint-disable-next-line react/no-array-index-key
								<ErrorPresentation key={index}>
									{emailLine.walletAddress}, {emailLine.tier || t('pages.importMembers.modal.errorsModal.tierFiller')},{' '}
									<ErrorAccent>{emailLine.email}</ErrorAccent>
								</ErrorPresentation>
							))}
						</ErrorSectionContent>
					</ErrorSection>
				)}

				{!!errors.walletsLines.length && (
					<ErrorSection>
						<StyledLabel>{t('pages.importMembers.modal.errorsModal.addressesHeading')}</StyledLabel>
						<ErrorSectionContent>
							{errors.walletsLines.map((walletLine, index) => (
								// eslint-disable-next-line react/no-array-index-key
								<ErrorPresentation key={index}>
									<ErrorAccent>{walletLine.walletAddress}</ErrorAccent>,{' '}
									{walletLine.tier || t('pages.importMembers.modal.errorsModal.tierFiller')}, {walletLine.email}
								</ErrorPresentation>
							))}
						</ErrorSectionContent>
					</ErrorSection>
				)}
			</ModalContent>

			<ModalFooter
				right={<Button onClick={onClose} label={t('pages.importMembers.modal.back')} size="lg" color="accentPrimary" />}
			/>
		</Modal>
	);
};

const StyledTitle1 = styled(Title1)`
	margin-bottom: 8px;
`;

const StyledLabel = styled(Label1)`
	margin-bottom: 8px;
`;

const StyledBody = styled(Body)`
	margin-bottom: 16px;
`;

const ErrorSection = styled.div`
	margin-bottom: 24px;
`;

const ErrorSectionContent = styled.div`
	width: 100%;
	height: 136px;
	background: ${colors.overlaySecondary};
	border-radius: 8px;
	padding: 8px 16px;
	overflow: auto;
`;

const ErrorPresentation = styled(Body)`
	color: ${colors.foregroundPrimary};
`;

const ErrorAccent = styled.span`
	color: ${colors.accentNegative};
`;
