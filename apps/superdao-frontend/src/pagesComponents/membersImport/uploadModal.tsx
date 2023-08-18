import { useTranslation } from 'next-i18next';
import { ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';
import { airdropGuideLink } from 'src/constants';
import { AirdropParticipantType } from './types';
import { Body, Button, Caption, CSVErrors, QuestionIcon, DownloadIcon, ErrorHintModal, Title1 } from 'src/components';
import { WarningIcon } from 'src/components/assets/icons/warning';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { InputFile } from 'src/components/inputFile';
import { useToggle } from 'src/hooks';
import { colors } from 'src/style';
import { csvToJson, scanDuplicatedEmails, scanInvalidAddresses } from 'src/utils/csv';

const modalStyles = {
	content: { width: 'min(400px, calc(100vw - 36px))', minWidth: 'min(320px, calc(100vw - 36px))' }
};

const fields = ['walletAddress', 'tier', 'email'];

type Props = {
	isOpen: boolean;
	onSubmit: (filename: string, result: AirdropParticipantType[]) => void;
	onCancel: () => void;
};

export const UploadModal = ({ isOpen, onSubmit, onCancel }: Props) => {
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [errorHints, setErrorHints] = useState<CSVErrors>({
		emailsLines: [],
		walletsLines: []
	});
	const [errorModalShouldBeOpen, toggleErrorModal] = useToggle(false);
	const [filename, setFilename] = useState('');
	const [participants, setParticipants] = useState<AirdropParticipantType[]>([]);

	const handleAirdropCsvFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event?.target?.files?.[0];

		if (!file) {
			return;
		}

		setFilename(file.name);
		setIsLoading(true);
		let value: AirdropParticipantType[] = [];
		try {
			value = await csvToJson<AirdropParticipantType>(file);
			const firstTarget = value[0];
			for (const field of fields) {
				if (!firstTarget.hasOwnProperty(field)) throw new Error();
			}
		} catch (e) {
			setErrorHints({
				emailsLines: [],
				walletsLines: []
			});
			setIsLoading(false);
			setError(t('pages.importMembers.modal.structure'));
			return;
		}
		setIsLoading(false);

		if (value.length > 1000) {
			setError(t('pages.importMembers.modal.restriction'));
			return;
		}

		const emailsLines = scanDuplicatedEmails(value);

		const lines = scanInvalidAddresses(value);

		setErrorHints({
			emailsLines,
			walletsLines: lines
		});

		if (emailsLines.length) {
			setError(t('pages.importMembers.modal.hasDuplicatedEmails'));
			return;
		}

		if (lines.length) {
			setError(t('pages.importMembers.modal.hasInvalidAddresses'));
			return;
		}

		setError('');
		setErrorHints({
			emailsLines: [],
			walletsLines: []
		});
		setParticipants(value);
	};

	const handleSubmit = () => {
		onSubmit(filename, participants);
	};

	const handleCancel = () => {
		setErrorHints({
			emailsLines: [],
			walletsLines: []
		});
		setError('');
		setFilename('');
		setParticipants([]);
		onCancel();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleCancel} style={modalStyles}>
			<ModalContent>
				<Title1>{t('pages.importMembers.modal.heading')}</Title1>
				<Body className="mt-2 mb-2" color={colors.foregroundSecondary}>
					{t('pages.importMembers.modal.description')} <b>wallet</b>, <b>tier</b>, <b>email</b>
				</Body>
				<Body color={colors.foregroundSecondary}>{t('pages.importMembers.modal.description1')}</Body>
				<Body className="mb-6" color={colors.foregroundSecondary}>
					{t('pages.importMembers.modal.description2')}
				</Body>
				<Body className="mb-6" color={colors.foregroundSecondary}>
					• {t('pages.importMembers.modal.description2')}
				</Body>

				<InputFile accept="text/csv" filename={filename} onChange={handleAirdropCsvFileUpload} />

				<RestrictionCaption className="mt-2" color={error ? colors.accentNegative : colors.foregroundTertiary}>
					{error || t('pages.importMembers.modal.restriction')}
				</RestrictionCaption>

				{Object.values(errorHints).some((errorHint) => errorHint.length) && (
					<ErrorHintArea onClick={toggleErrorModal}>
						<WarningIcon />
						<p>{t('pages.importMembers.modal.errorHint')}</p>
					</ErrorHintArea>
				)}
				{errorModalShouldBeOpen && <ErrorHintModal errors={errorHints} onClose={toggleErrorModal} />}

				<DownloadTemplate className="mt-5 flex items-center" target="_blank" href="/assets/csv-example.csv">
					<DownloadIcon width={20} height={20} />
					<Body color={colors.foregroundPrimary}>{t('pages.importMembers.modal.downloadTemplate')}</Body>
				</DownloadTemplate>
				<DownloadTemplate className="mt-4 flex items-center" target="_blank" href={airdropGuideLink} rel="noreferrer">
					<QuestionIcon width={20} height={20} fill={colors.foregroundSecondary} />
					<Body color={colors.foregroundPrimary}>{t('pages.importMembers.modal.seeOurGuideLink')}</Body>
				</DownloadTemplate>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button onClick={handleCancel} label={t('actions.labels.cancel')} size="lg" color="backgroundTertiary" />
						<Button
							onClick={handleSubmit}
							label={t('pages.importMembers.modal.upload')}
							size="lg"
							color="accentPrimary"
							isLoading={isLoading}
							disabled={participants.length === 0 || !!error}
						/>
					</>
				}
			/>
		</Modal>
	);
};

const RestrictionCaption = styled(Caption)`
	padding: 0 16px;
`;

const DownloadTemplate = styled.a`
	display: flex;
	gap: 12px;
`;

const ErrorHintArea = styled.div`
	position: relative;
	width: 100%;
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 20px;
	margin-bottom: 16px;
	color: ${colors.accentNegative};
	cursor: pointer;
`;
