import { useCallback, useEffect, useMemo, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import { ErrorCode, FileRejection } from 'react-dropzone';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';

import { useMediaCompression, useSwitch } from 'src/hooks';
import { NftAdminUpdateCollectionTxInput, NftMetadataInput, TierArtworkTypeStrings } from 'src/types/types.generated';
import { isVideo, MAX_ARTWORKS_LENGTH } from '../../constants';
import { ArtworksEditModal } from './artworksEditModal';
import { useUploadHelper } from './hooks/useUploadHelper';
import { RejectedFiles } from './types';
import { ArtworksPreview } from './artworksPreview';
import { ArtworkPreviewGenerated, VideoFirstFrame, VideoMetadata } from './videoPreview';
import { useWatchArtworkLengthToCalcTierType } from './hooks/useWatchArtworkLengthToCalcTierType';

type Props = {
	index: number;
	isNewTier: boolean;
	name: string | undefined;
	amount: number | undefined;
	collectionName: string;
};

export const ArtworksContainer = (props: Props) => {
	const { name = '', amount = 0, collectionName, index, isNewTier } = props;

	const { compress } = useMediaCompression();
	const { t } = useTranslation();
	const [rejectedFiles, setRejectedFiles] = useState<RejectedFiles[]>();
	const [videoMetadata, setVideoMetadata] = useState<VideoMetadata[] | null>(null);
	const [generatedPreview, setGeneratedPreview] = useState<ArtworkPreviewGenerated[]>();
	const [isOpen, { on, off }] = useSwitch(false);
	const { maxSizeValidator, errorByCode } = useUploadHelper();
	const { control, watch, setValue, setError, clearErrors } = useFormContext<NftAdminUpdateCollectionTxInput>();

	const { append: appendArtwork, remove: fullRemoveArtwork } = useFieldArray({
		control,
		name: `tiers.${index}.artworks`
	});
	useWatchArtworkLengthToCalcTierType(index);

	const { defaultValues, errors, dirtyFields } = useFormState({ control });
	const [tierArtworkType, uploadArtworks] = watch([`tiers.${index}.tierArtworkType`, `tiers.${index}.artworks`]);

	/**
	 * Когда модалка артворков сохраняется, мы должны запомнить новый default для артворков тира
	 */
	const [draftArtworks, setDraftArtworks] = useState<NftMetadataInput[]>(uploadArtworks);

	useEffect(() => {
		const artworks = defaultValues?.tiers?.[index]?.artworks?.map((artwork, index) => ({
			animationUrl: artwork?.animationUrl,
			image: artwork?.image,
			id: artwork?.id || `${index + 1}`
		}));

		/**
		 * Запуск генерации превью для артворков с видео и без установленных превью,
		 * запускается только для default значения формы
		 */
		const videoArtworksWithoutPreview = artworks?.filter((artwork) => artwork?.animationUrl && !artwork.image);
		const animationsMetadata = videoArtworksWithoutPreview?.map((artwork) => ({
			id: artwork.id,
			blob: artwork.animationUrl || ''
		}));

		if (animationsMetadata) {
			setVideoMetadata(animationsMetadata);
		}

		/**
		 * Сохраняем превью дефолтных артворков
		 */
		const videoArtworksWithPreview = artworks?.filter((artwork) => artwork?.animationUrl && artwork.image);
		const previewMetadata = videoArtworksWithPreview?.map((artwork) => ({
			id: artwork.id,
			image: artwork.image || ''
		}));

		if (previewMetadata) {
			setGeneratedPreview(previewMetadata);
		}
	}, [defaultValues?.tiers, index]);

	const isMultiple = isNewTier || tierArtworkType !== TierArtworkTypeStrings.One;
	const isEmpty = uploadArtworks.length === 0 || (uploadArtworks.length === 1 && _isEmpty(uploadArtworks[0]));
	const defaultTier = useMemo(() => defaultValues?.tiers?.[index], [defaultValues?.tiers, index]);
	const isSingle = useMemo(
		() => defaultTier?.tierArtworkType === TierArtworkTypeStrings.One,
		[defaultTier?.tierArtworkType]
	);
	const uploadedArtworksLength = useMemo(() => uploadArtworks?.length || 0, [uploadArtworks?.length]);
	const maxAvailableArtworksLength = useMemo(() => {
		if (isNewTier) {
			return MAX_ARTWORKS_LENGTH.isRandomShuffleMint;
		}

		if (defaultTier?.tierArtworkType === TierArtworkTypeStrings.One) {
			return MAX_ARTWORKS_LENGTH.single;
		}

		return defaultTier?.artworks?.length || 0;
	}, [isNewTier, defaultTier]);
	const maxLeftArtworksToUpload = useMemo(() => {
		if (isNewTier) {
			return MAX_ARTWORKS_LENGTH.isRandomShuffleMint - uploadedArtworksLength;
		}

		if (defaultTier?.tierArtworkType === TierArtworkTypeStrings.One) {
			return MAX_ARTWORKS_LENGTH.single - uploadedArtworksLength;
		}

		const size = maxAvailableArtworksLength - uploadedArtworksLength;

		if (size < 0) return 0;

		return size;
	}, [isNewTier, defaultTier?.tierArtworkType, maxAvailableArtworksLength, uploadedArtworksLength]);

	const handleRemoveRejectedFile = useCallback(
		(index: number) => setRejectedFiles((files) => files?.filter((_, fileIndex) => index !== fileIndex)),
		[]
	);

	const handleRemoveArtworkFieldItem = useCallback(
		(fileIndex: number, fieldName: keyof NftMetadataInput) => {
			setValue(`tiers.${index}.artworks.${fileIndex}.${fieldName}`, undefined, { shouldDirty: true });
		},
		[index, setValue]
	);

	/**
	 * Рантайм валидация проверки числа артворков
	 * Валидация нового тира не происходит, так как заранее установлено максимальное число атворков,
	 * а тип тира устанавливается при его создании (сохранении)
	 * При редактирования созданного в контракте тира:
	 * maxAamunt не может измениться, Single тир имеет число артворков < 2,
	 * а у Random и Shuffle мы валидируем только число артворков (оно не должно меняться)
	 */
	useEffect(() => {
		/**
		 * Для тиров, которые уже в контракте жестко валидируем
		 */
		if (!isNewTier) {
			if (!isSingle) {
				/**
				 * Если не сингл, проверяем, что количество установленных ранее артворков совпадает с текущим
				 */
				const isArtworksCountEqual = maxAvailableArtworksLength === uploadedArtworksLength;

				if (!isArtworksCountEqual) {
					setError(`tiers.${index}.artworks.0`, {
						type: 'custom',
						message: t('modals.selfServiceTier.fields.artwork.errorEquality', { count: maxAvailableArtworksLength })
					});
				} else {
					clearErrors(`tiers.${index}.artworks.0`);
				}
			}
		}
	}, [isNewTier, index, uploadedArtworksLength, isSingle, maxAvailableArtworksLength, t, setError, clearErrors]);

	const handleClose = useCallback(() => {
		setValue(`tiers.${index}.artworks`, draftArtworks || []);
		setRejectedFiles(undefined);
		off();
	}, [index, draftArtworks, off, setValue]);

	const handleSave = useCallback(() => {
		const artworks = uploadArtworks?.map((artwork) => {
			if (!artwork.image) {
				const image = generatedPreview?.find(({ id }) => artwork.id === id)?.image;
				return { ...artwork, image };
			}

			return artwork;
		});

		/**
		 * При сохранении артворков из модалки состояние dirty становится true и в модалке артворков кнопка save теперь всегда active
		 */
		setValue(`tiers.${index}.artworks`, artworks);
		setDraftArtworks(artworks);
		setRejectedFiles(undefined);

		off();
	}, [index, uploadArtworks, generatedPreview, off, setValue]);

	const handleSaveGeneratedPreview = useCallback(
		(value: ArtworkPreviewGenerated) => setGeneratedPreview((state = []) => [...state, value]),
		[]
	);
	const [compressingArtworks, setCompressingArtworks] = useState<Array<{ id: string; name: string }>>([]);

	const handleUploadArtworks = useCallback(
		async (files: File[], rejectedOnDrop: FileRejection[]) => {
			if (!isOpen) on();
			if (!files?.length) return;

			setCompressingArtworks((aws) => [
				...aws,
				...files.map((f, i) => ({
					name: f.name,
					id: `new_${uploadedArtworksLength + i}`
				}))
			]);

			for (let i = 0; i < files.length; i++) {
				const uploadedFile = files[i];
				const id = `new_${uploadedArtworksLength + i}`;

				let initialSize = uploadedFile.size,
					compressedSize: number | undefined,
					compressedBlob: Blob | undefined;
				try {
					({ initialSize, compressedSize, blob: compressedBlob } = await compress(uploadedFile));
				} catch {
					setCompressingArtworks((aws) => aws.filter((aw) => aw.id !== id));
				}

				const isPickCompressed = !!compressedBlob && !!compressedSize && initialSize > compressedSize;
				const file = isPickCompressed && compressedBlob ? compressedBlob : uploadedFile;
				const blobSrc = URL.createObjectURL(file);

				const isVideoFile = isVideo(uploadedFile.name);

				const sizeError = maxSizeValidator(new File([file], uploadedFile.name));

				if (sizeError) {
					rejectedOnDrop.push({ file: files.splice(i, 1)[0], errors: [sizeError] });
				} else {
					appendArtwork({
						id,
						animationUrl: isVideoFile ? blobSrc : '',
						animationUrlName: isVideoFile ? uploadedFile.name : '',
						image: isVideoFile ? '' : blobSrc,
						imageName: isVideoFile ? '' : uploadedFile.name,
						initialSize,
						compressedSize: isPickCompressed ? compressedSize : undefined
					});

					if (isVideoFile) {
						setVideoMetadata((state = []) => {
							return [
								...(state || []),
								{
									id: `new_${uploadedArtworksLength + i}`,
									blob: blobSrc
								}
							];
						});
					}
				}
				setCompressingArtworks((aws) => aws.filter((aw) => aw.id !== id));
			}

			setRejectedFiles((list = []) => {
				const rejectedFiles = rejectedOnDrop?.map((reject, index) => ({
					id: `rejected-${list?.length + index}`,
					filename: reject?.file?.name,
					error:
						reject.errors?.[0]?.code === ErrorCode.FileInvalidType
							? errorByCode?.[reject.errors?.[0]?.code]
							: reject.errors?.[0]?.message
				}));

				return [...list, ...rejectedFiles];
			});
		},
		[isOpen, on, compress, appendArtwork, uploadedArtworksLength, maxSizeValidator, errorByCode]
	);

	const handleUploadPreview = useCallback(
		(file: File, artworkIndex: number) => {
			if (!file) return;

			const blobSrc = URL.createObjectURL(file);

			const isVideoFile = isVideo(file.name);

			if (isVideoFile) {
				setValue(`tiers.${index}.artworks.${artworkIndex}.animationUrl`, blobSrc);
				setValue(`tiers.${index}.artworks.${artworkIndex}.animationUrlName`, file.name);
			} else {
				setValue(`tiers.${index}.artworks.${artworkIndex}.image`, blobSrc);
				setValue(`tiers.${index}.artworks.${artworkIndex}.imageName`, file.name);
			}
		},
		[index, setValue]
	);

	const disabled = useMemo(
		() =>
			uploadArtworks?.length < 1 ||
			!!Object.keys(errors?.tiers?.[index]?.artworks ?? {})?.length ||
			!Object.keys(dirtyFields?.tiers?.[index]?.artworks ?? {})?.length,
		[uploadArtworks?.length, errors?.tiers, dirtyFields?.tiers, index]
	);

	return (
		<>
			<ArtworksPreview
				tierIdx={index}
				isEmpty={isEmpty}
				isMultiple={isMultiple}
				name={name}
				amount={amount}
				collectionName={collectionName}
				tierArtworkType={tierArtworkType}
				uploadArtworks={uploadArtworks}
				maxFiles={maxLeftArtworksToUpload}
				onOpenModal={on}
				onUpload={handleUploadArtworks}
			/>
			<ArtworksEditModal
				isEmpty={isEmpty}
				isDisabled={disabled}
				isOpen={isOpen}
				isMultiple={isMultiple}
				rejectedFiles={rejectedFiles}
				tierArtworkType={tierArtworkType}
				maxFiles={maxLeftArtworksToUpload}
				uploadArtworks={uploadArtworks}
				error={errors?.tiers?.[index]?.artworks?.[0]?.message}
				onClose={handleClose}
				onRemoveArtwork={fullRemoveArtwork}
				onRemoveArtworkFieldItem={handleRemoveArtworkFieldItem}
				onRemoveRejected={handleRemoveRejectedFile}
				onSave={handleSave}
				onUpload={handleUploadArtworks}
				onUploadPreview={handleUploadPreview}
				compressingArtworks={compressingArtworks}
			/>

			{videoMetadata?.map((item) => (
				<VideoFirstFrame
					key={item.id}
					blob={item.blob}
					id={item.id}
					updateArtworkPreview={handleSaveGeneratedPreview}
					setVideoMetadata={() =>
						setVideoMetadata((state = []) => state?.filter((metadata) => metadata.id === item.id) || null)
					}
				/>
			))}
		</>
	);
};
