import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { ErrorCode } from 'react-dropzone';
import { IMG_MAX_SIZE_IN_BYTE, isVideo, MAX_ARTWORK_SIZE_TRANSLATE, VIDEO_MAX_SIZE_IN_BYTE } from '../../../constants';

export const useUploadHelper = () => {
	const { t } = useTranslation();

	const errorByCode = useMemo(
		() => ({
			[ErrorCode.FileInvalidType]: t('modals.selfServiceTier.fields.artwork.wrongFormat'),
			[ErrorCode.TooManyFiles]: t('modals.selfServiceTier.fields.artwork.tooManyFiles')
		}),
		[t]
	);

	const maxSizeValidator = useCallback(
		(file: File) => {
			const isInvalid = isVideo(file.name) ? file.size > VIDEO_MAX_SIZE_IN_BYTE : file.size > IMG_MAX_SIZE_IN_BYTE;

			if (isInvalid) {
				return {
					code: ErrorCode.FileTooLarge,
					message: t('modals.selfServiceTier.fields.artwork.maxSize', {
						size: isVideo(file.name) ? MAX_ARTWORK_SIZE_TRANSLATE.videoSize : MAX_ARTWORK_SIZE_TRANSLATE.imgSize
					})
				};
			}

			return null;
		},
		[t]
	);

	return { maxSizeValidator, errorByCode };
};
