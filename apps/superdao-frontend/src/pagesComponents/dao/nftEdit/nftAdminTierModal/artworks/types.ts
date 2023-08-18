import { FileRejection } from 'react-dropzone';
import { NftMetadata, NftMetadataInput, TierArtworkTypeStrings } from 'src/types/types.generated';

export type RejectedFiles = {
	id: string;
	filename: string;
	error: string;
};

export type UploadProps = {
	isEmpty: boolean;
	isMultiple: boolean;
	tierArtworkType: TierArtworkTypeStrings;
	uploadArtworks: NftMetadata[];
	maxFiles?: number;
	onUpload: (files: File[], fileRejections: FileRejection[]) => void;
};

export type RemoveFieldItemFn = (fileIndex: number, fieldName: keyof NftMetadataInput) => void;
export type UploadPreviewFn = (file: File, artworkIndex: number) => void;
