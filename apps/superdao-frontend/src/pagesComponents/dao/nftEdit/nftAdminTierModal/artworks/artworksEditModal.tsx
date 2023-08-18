import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Button, Error, Title1 } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { TierArtworkTypeStrings } from 'src/types/types.generated';
import { allAccept, MAX_ARTWORK_SIZE_TRANSLATE, selfServiceTierModalStyles } from '../../constants';
import { CompressingArtwork } from './compressingArtwork';
import { RejectedFiles, RemoveFieldItemFn, UploadPreviewFn, UploadProps } from './types';
import { UploadArtwork } from './uploadArtwork';
import { UploadedArtwork, UploadedArtworkProps } from './uploadedArtwork';

type Props = {
	isOpen: boolean;
	rejectedFiles?: RejectedFiles[];
	error?: string;
	isDisabled?: boolean;
	compressingArtworks: any[];
	onSave: () => void;
	onClose: () => void;
	onRemoveArtworkFieldItem?: RemoveFieldItemFn;
	onUploadPreview?: UploadPreviewFn;
} & UploadProps &
	Pick<UploadedArtworkProps, 'onRemoveArtwork' | 'onRemoveRejected'>;

export const ArtworksEditModal = (props: Props) => {
	const {
		isDisabled,
		isEmpty,
		isOpen,
		isMultiple,
		compressingArtworks,
		tierArtworkType,
		uploadArtworks,
		maxFiles = 0,
		rejectedFiles,
		error,
		onRemoveArtworkFieldItem,
		onUploadPreview,
		onRemoveArtwork,
		onRemoveRejected,
		onClose,
		onSave,
		onUpload
	} = props;
	const { t } = useTranslation();

	const isActiveUpload = useMemo(() => isEmpty || (isMultiple && maxFiles > 0), [isEmpty, isMultiple, maxFiles]);

	const handleSubmit = () => {
		onSave();
	};
	const handleClose = () => {
		onClose();
	};

	const submitText = useMemo(() => {
		if (tierArtworkType === TierArtworkTypeStrings.One) {
			return t('modals.selfServiceTier.preview.addArtwork');
		}

		if (tierArtworkType === TierArtworkTypeStrings.Random) {
			return uploadArtworks?.length
				? t('modals.selfServiceTier.preview.addArtworksCount', { count: uploadArtworks?.length })
				: t('modals.selfServiceTier.preview.addArtworks');
		}

		return t('modals.selfServiceTier.preview.addArtwork');
	}, [tierArtworkType, uploadArtworks, t]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={selfServiceTierModalStyles}>
			<ModalContent className="pt-5 pb-8">
				<Title1>{t('modals.selfServiceTier.preview.heading')}</Title1>
				<div className="mt-6">
					{compressingArtworks?.map((artwork, i) => (
						<CompressingArtwork key={artwork.id} name={artwork.name ?? `Artwork ${i + 1}`} />
					))}
					{uploadArtworks?.map((artwork, index) => (
						<UploadedArtwork
							key={artwork.id}
							artwork={artwork}
							artworkIndex={index}
							onRemoveArtwork={onRemoveArtwork}
							onRemoveArtworkFieldItem={onRemoveArtworkFieldItem}
							onUpload={onUploadPreview}
						/>
					))}
					{rejectedFiles?.map((rejected, index) => (
						<UploadedArtwork
							key={rejected.id}
							rejected={rejected}
							artworkIndex={index}
							onRemoveRejected={onRemoveRejected}
						/>
					))}
				</div>
				{isActiveUpload && (
					<UploadArtwork
						accept={allAccept}
						label={t('modals.selfServiceTier.uploadAnotherPlaceholder')}
						multiple={isMultiple}
						hint={t('modals.selfServiceTier.preview.upload', MAX_ARTWORK_SIZE_TRANSLATE)}
						maxFiles={maxFiles}
						onUpload={onUpload}
					/>
				)}
				{error && <Error className="static">{error}</Error>}
			</ModalContent>
			<ModalFooter
				right={
					<>
						<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={handleClose} />
						<Button size="lg" color="accentPrimary" label={submitText} disabled={isDisabled} onClick={handleSubmit} />
					</>
				}
			/>
		</Modal>
	);
};
