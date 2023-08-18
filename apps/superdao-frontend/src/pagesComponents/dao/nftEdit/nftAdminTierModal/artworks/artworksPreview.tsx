import { useTranslation } from 'next-i18next';
import { ArtworkView, NftCardTierInfo, NftCardTitle } from 'src/components';
import { EditFillIcon } from 'src/components/assets/icons/editFill';
import { allAccept, MAX_ARTWORK_SIZE_TRANSLATE } from '../../constants';
import { UploadProps } from './types';
import { NftCardAttributesContainer } from './NftCardAttributesContainer';
import { UploadArtwork } from './uploadArtwork';

const sliderProps = {
	isSlider: true,
	className: 'h-[208px]'
};

type Props = {
	tierIdx: number;
	isEmpty: boolean;
	name: string;
	amount: number;
	collectionName: string;
	onOpenModal: () => void;
} & UploadProps;

export const ArtworksPreview = (props: Props) => {
	const { t } = useTranslation();
	const {
		tierIdx,
		name,
		amount,
		collectionName,
		isEmpty,
		isMultiple,
		tierArtworkType,
		uploadArtworks,
		maxFiles,
		onUpload,
		onOpenModal
	} = props;

	return (
		<div className="bg-backgroundSecondary w-[240px] overflow-hidden rounded-lg">
			<div className="flex flex-col">
				{isEmpty ? (
					<UploadArtwork
						accept={allAccept}
						className="mx-4 mt-4"
						type="square"
						label={t('modals.selfServiceTier.preview.upload', MAX_ARTWORK_SIZE_TRANSLATE)}
						multiple={isMultiple}
						maxFiles={maxFiles}
						onUpload={onUpload}
					/>
				) : (
					<div className="bg-overlaySecondary relative mx-4 mt-4 h-[208px] w-[208px] overflow-hidden">
						<div
							onClick={onOpenModal}
							className="z-1 bg-overlayModal absolute top-3 right-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:opacity-75"
						>
							<EditFillIcon width={12} height={12} />
						</div>
						<ArtworkView
							className="bg-overlaySecondary h-[208px] w-[208px] overflow-hidden rounded-lg"
							artworks={uploadArtworks || []}
							artworksTotalLength={uploadArtworks?.length}
							sliderProps={sliderProps}
						/>
					</div>
				)}
				<div className="p-4 pt-3">
					<NftCardTierInfo
						tier={{
							id: 'mock-tier',
							tierName: name,
							totalAmount: 0,
							maxAmount: amount
						}}
						collectionName={collectionName}
						tierArtworkType={tierArtworkType}
					/>
					<NftCardTitle className="mt-2" content={name} />
					<NftCardAttributesContainer tierIdx={tierIdx} />
				</div>
			</div>
		</div>
	);
};
