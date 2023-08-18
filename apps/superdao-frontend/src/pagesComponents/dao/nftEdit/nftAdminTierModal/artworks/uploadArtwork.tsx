import { ReactNode, useCallback } from 'react';
import { useDropzone, DropzoneOptions, FileRejection } from 'react-dropzone';
import cn from 'classnames';

import { Body, Caption, HintIcon, SubHeading, UploadIcon } from 'src/components';
import { InputProps } from 'src/components/input';
import Tooltip from 'src/components/tooltip';
import { colors } from 'src/style';

export type UploadFileProps = Omit<InputProps, 'accept'> &
	Pick<DropzoneOptions, 'maxSize' | 'accept' | 'maxFiles'> & {
		filename?: string;
		isEditable?: boolean;
		isUploadEnabled?: boolean;
		dataTestid?: string;
		label?: ReactNode;
		className?: string;
		hint?: string;
		onUpload?: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
		type?: 'square' | 'input';
	};

export const UploadArtwork = (props: UploadFileProps) => {
	const {
		dataTestid,
		isUploadEnabled = true,
		label,
		type = 'input',
		className,
		accept,
		maxSize,
		multiple,
		maxFiles,
		hint,
		onUpload
	} = props;

	const onDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			onUpload?.(acceptedFiles, fileRejections);
		},
		[onUpload]
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		maxFiles,
		accept,
		multiple,
		maxSize,
		disabled: !isUploadEnabled
	});

	const isSquare = type === 'square';

	return (
		<label
			data-testid={dataTestid}
			className={cn(
				'bg-overlaySecondary border-foregroundQuaternary flex cursor-pointer rounded-lg border-[1px] border-dashed',
				{
					'cursor-no-drop': !isUploadEnabled
				},
				className
			)}
			{...getRootProps()}
		>
			<input {...getInputProps()} />
			<div
				className={cn('flex justify-center px-4 py-2', {
					'h-[208px] w-[208px] flex-col': isSquare,
					'h-[38px] w-full items-center': !isSquare
				})}
			>
				<div
					className={cn('flex', {
						'h-full flex-col items-center justify-center': isSquare,
						'h-full w-full items-center': !isSquare
					})}
				>
					<UploadIcon width={isSquare ? 24 : 16} height={isSquare ? 24 : 16} className="fill-foregroundTertiary" />
					{isSquare ? (
						<Caption className="text-foregroundTertiary mt-3 max-w-[164px] text-center">{label}</Caption>
					) : (
						<Body className="text-foregroundTertiary ml-3 text-center">{label}</Body>
					)}
				</div>
				{hint && (
					<div>
						<Tooltip
							content={<SubHeading className="max-w-[205px] whitespace-normal">{hint}</SubHeading>}
							placement="top"
						>
							<HintIcon color={colors.foregroundTertiary} height={16} width={16} />
						</Tooltip>
					</div>
				)}
			</div>
		</label>
	);
};
