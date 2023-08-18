import { ReactNode, useMemo } from 'react';
import styled from '@emotion/styled';

import { Body, Label1 } from 'src/components/text';
import { useUploadWidget } from 'src/hooks';
import { colors } from 'src/style';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { CrossIcon } from './assets/icons';

type Props = {
	before?: ReactNode;
	imageWrapperClassName?: string;
	imageClassName?: string;
	label?: string;
	content: string;
	currentFile?: string | null;
	onChange: (file: string | undefined) => void;
};

export const VotingAttachmentUploader = ({
	before,
	label,
	content,
	currentFile,
	imageClassName,
	imageWrapperClassName,
	onChange
}: Props) => {
	const [files, uploadWidget] = useUploadWidget({
		imagesOnly: true,
		onNewFile: onChange
	});
	const lastUploadedFile = files?.at?.(-1);

	const [file, fileUrl] = useMemo(() => {
		if (lastUploadedFile) {
			return [lastUploadedFile, getOptimizedFileUrl(lastUploadedFile ?? '')];
		}

		return currentFile ? [currentFile, getOptimizedFileUrl(currentFile)] : [undefined, undefined];
	}, [currentFile, lastUploadedFile]);

	const bindDeleteAttachment = (file: string | undefined) => () => {
		if (file) {
			uploadWidget.delete(file);
			onChange(undefined);
		}
	};

	return (
		<>
			{fileUrl && (
				<div className={`relative h-max w-max ${imageWrapperClassName}`}>
					<img className={imageClassName} src={fileUrl} data-testid={'ProposalCreate__ImagePreview'} />
					<DeleteButton onClick={bindDeleteAttachment(file)} data-testid={'ProposalCreate__ImageDeleteButton'}>
						<CrossIcon fill={colors.foregroundPrimary} />
					</DeleteButton>
				</div>
			)}
			{label && <Label1 className="my-2">{label}</Label1>}
			{!fileUrl && (
				<div
					className="border-foregroundQuaternary bg-backgroundTertiary flex h-10 w-[274px] cursor-pointer items-center rounded-lg border border-dashed py-2 px-4"
					onClick={uploadWidget.open}
					data-testid={'ProposalCreate__ImageUploader'}
				>
					{before}
					<Body className="text-foregroundTertiary ml-3">{content}</Body>
				</div>
			)}
			{uploadWidget.render()}
		</>
	);
};

const DeleteButton = styled.div`
	cursor: pointer;
	position: absolute;
	top: 13px;
	right: 13px;

	width: 24px;
	height: 24px;
	border-radius: 50%;

	display: flex;
	align-items: center;
	justify-content: center;

	background: rgba(37, 43, 54, 0.7);
	backdrop-filter: blur(4px);
`;
