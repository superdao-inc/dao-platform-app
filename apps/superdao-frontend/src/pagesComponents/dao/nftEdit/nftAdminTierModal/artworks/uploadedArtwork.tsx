import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import cn from 'classnames';
import { UseFieldArrayRemove } from 'react-hook-form';
import { FileRejection } from 'react-dropzone';
import { ArtworkView, Caption, ChevronRight, CrossIcon, Error, Label1, TrashIcon } from 'src/components';
import { ControlContainer } from 'src/components/artwork/controlContainer';
import { DeclinedFileIcon } from 'src/components/assets/icons/declinedFile';
import { ZoomInIcon } from 'src/components/assets/icons/zoomIn';
import { colors } from 'src/style';
import { NftMetadata } from 'src/types/types.generated';
import { RejectedFiles, RemoveFieldItemFn, UploadPreviewFn } from './types';
import { ArrowLineIcon } from 'src/components/assets/icons/arrowLine';
import { UploadArtwork } from './uploadArtwork';
import { imageAccept, MAX_ARTWORK_SIZE_TRANSLATE } from '../../constants';
import { humanFileSize } from 'src/utils/formattes';

export type UploadedArtworkProps = {
	artworkIndex: number;
	artwork?: NftMetadata;
	rejected?: RejectedFiles;
	onRemoveArtworkFieldItem?: RemoveFieldItemFn;
	onRemoveArtwork?: UseFieldArrayRemove;
	onRemoveRejected?: (index: number) => void;
	onUpload?: UploadPreviewFn;
};

export const UploadedArtwork = (props: UploadedArtworkProps) => {
	const { artwork, artworkIndex, rejected, onUpload, onRemoveArtwork, onRemoveRejected, onRemoveArtworkFieldItem } =
		props;

	const { t } = useTranslation();

	const nameFilePreview = artwork?.imageName || `Artwork ${artworkIndex + 1} preview`;
	const nameArtwork = artwork?.animationUrl ? artwork?.animationUrlName : artwork?.imageName;
	const nameFile = rejected?.filename || nameArtwork || `Artwork ${artworkIndex + 1}`;

	/**
	 * Разделиление артворк объекта на preview и main.
	 * Нужно для того, чтобы для видео показывать видео без картинки
	 * А в preview наоборот, только картинку
	 */
	const previewArtwork = {
		...artwork,
		animationUrl: ''
	};

	const mainArtwork = {
		...artwork,
		image: artwork?.animationUrl ? '' : artwork?.image
	};

	const isCompreessionEnabled = true;

	const handleUploadPreview = useCallback(
		(files: File[], _: FileRejection[]) => {
			if (!files?.length) return;
			onUpload?.(files?.[0], artworkIndex);
		},
		[onUpload, artworkIndex]
	);

	return (
		<>
			<div
				className={cn('mb-5 flex min-h-[84px] w-full items-start', {
					'mb-4': !!artwork?.animationUrl
				})}
			>
				<div className="bg-backgroundTertiary relative h-[84px] w-[84px] overflow-hidden rounded-lg">
					{artwork ? (
						<ArtworkView
							artworks={[mainArtwork]}
							playOnHover={false}
							showCustomControls={false}
							className="bg-backgroundTertiary h-[84px] w-[84px] overflow-hidden rounded-lg"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<DeclinedFileIcon width={32} height={32} className="fill-foregroundTertiary" />
						</div>
					)}
				</div>
				<div className="max-w-[352px] flex-1 px-5">
					<div className="mb-3 w-full truncate">
						<Label1 className="truncate">{nameFile}</Label1>
					</div>
					{artwork && isCompreessionEnabled && (
						<div className="w-full">
							{/* <div className="mb-1 flex items-baseline">
								<div className=" w-[84px] ">
									<Caption className="text-foregroundTertiary">
										{t('modals.selfServiceTier.preview.resolution')}
									</Caption>
								</div>
							</div> */}
							{!!artwork.initialSize && (
								<div className="mb-1 flex items-baseline">
									<Caption className=" text-foregroundTertiary pr-5">
										{t('modals.selfServiceTier.preview.size')}
									</Caption>

									<Caption className="flex items-center">
										<span className="text-foregroundSecondary">
											{humanFileSize(artwork.initialSize ? artwork.initialSize : 0)}
										</span>
										{!!artwork.compressedSize && (
											<>
												<ChevronRight className=" mx-2" color={colors.foregroundQuaternary} />
												<span className="text-accentPositive">{humanFileSize(artwork.compressedSize)}</span>
											</>
										)}
									</Caption>
								</div>
							)}
						</div>
					)}
					{rejected?.error && (
						<div className="bg-accentNegativeBackground inline-block rounded-[4px] px-3 py-1">
							<Caption className="text-accentNegative">{rejected?.error}</Caption>
						</div>
					)}
				</div>
				<div className="flex min-w-[76px] items-center justify-end">
					{/* <ControlContainer className="!bg-overlaySecondary h-8 w-8 rounded-lg">
						<ZoomInIcon className="h-5 w-5" color={colors.foregroundSecondary} />
					</ControlContainer> */}
					{onRemoveArtwork && (
						<ControlContainer
							className="!bg-overlaySecondary ml-1 h-8 w-8 rounded-lg"
							onClick={() => onRemoveArtwork(artworkIndex)}
						>
							<TrashIcon className="h-5 w-5" fill={colors.accentNegative} />
						</ControlContainer>
					)}
					{onRemoveRejected && (
						<ControlContainer
							className="!bg-overlaySecondary ml-2 h-8 w-8 rounded-lg"
							onClick={() => onRemoveRejected(artworkIndex)}
						>
							<CrossIcon className="h-5 w-5" fill={colors.foregroundSecondary} />
						</ControlContainer>
					)}
				</div>
			</div>
			{artwork?.animationUrl && (
				<div className="mb-5 flex min-h-[40px] w-full items-start">
					<div className="flex h-[40px] w-[84px] items-center justify-end">
						<ArrowLineIcon width={20} height={20} />
					</div>
					<div className="w-full flex-1 pl-5">
						{!artwork?.image ? (
							<>
								<UploadArtwork
									accept={imageAccept}
									label={t('modals.selfServiceTier.previewPlaceholder')}
									hint={t('modals.selfServiceTier.hints.preview', MAX_ARTWORK_SIZE_TRANSLATE)}
									onUpload={handleUploadPreview}
								/>
								<Error className="text-foregroundTertiary static">
									{t('modals.selfServiceTier.preview.emptyPreview')}
								</Error>
							</>
						) : (
							<div className="bg-overlaySecondary flex h-[40px] max-w-[406px] items-center justify-between rounded-lg border-[1px] border-transparent p-1">
								<div className="relative h-8 w-8">
									<ArtworkView
										artworks={[previewArtwork]}
										className="bg-overlaySecondary h-8 w-8 overflow-hidden rounded-[4px]"
									/>
								</div>
								<div className="flex-1 truncate px-3">
									<Label1 className="truncate">{nameFilePreview}</Label1>
								</div>
								<div className="flex min-w-[64px] items-center justify-end">
									{isCompreessionEnabled && (
										<ControlContainer className="h-7 w-7 rounded-lg !bg-transparent">
											<ZoomInIcon className="h-4 w-4" color={colors.foregroundSecondary} />
										</ControlContainer>
									)}
									{true && (
										<ControlContainer
											className="ml-1 h-7 w-7 rounded-lg !bg-transparent"
											onClick={() => onRemoveArtworkFieldItem?.(artworkIndex, 'image')}
										>
											<TrashIcon className="h-4 w-4" fill={colors.accentNegative} />
										</ControlContainer>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};
