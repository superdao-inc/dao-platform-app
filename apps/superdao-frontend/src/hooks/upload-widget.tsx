import { useRef, useState } from 'react';

import { Widget, FileInfo, WidgetProps, WidgetAPI } from '@uploadcare/react-widget';

import { UPLOADCARE_PUBLIC_KEY } from 'src/utils/upload';

import { enrichFileUUID } from 'src/utils/upload';

type UploadWidgetParams = {
	crop?: WidgetProps['crop'];
	imagesOnly?: WidgetProps['imagesOnly'];
	initialFiles?: string[];
	onNewFile?: (file: string) => void;
};

export const useUploadWidget = (params?: UploadWidgetParams) => {
	const { crop = 'free', imagesOnly = true, initialFiles, onNewFile } = params || {};

	const [files, setFiles] = useState<string[]>(initialFiles || []);
	const widgetRef = useRef<WidgetAPI>(null);

	const onChange = (file: FileInfo) => {
		if (!file.uuid) {
			return;
		}
		if (!file.crop) {
			return;
		}

		setFiles([...files, enrichFileUUID(file.uuid, file.crop)]);
		onNewFile?.(file.uuid);
	};

	const openWidget = () => {
		widgetRef?.current?.openDialog();
	};

	const renderWidget = () => {
		return (
			<>
				<Widget
					ref={widgetRef}
					crop={crop}
					imagesOnly={imagesOnly}
					onChange={onChange}
					tabs="file"
					publicKey={UPLOADCARE_PUBLIC_KEY}
					preloader={null}
				/>
			</>
		);
	};

	const resetWidget = () => {
		setFiles([]);
	};

	const deleteFile = (fileId: string) => {
		setFiles(files.filter((item) => item !== fileId));
	};

	return [files, { open: openWidget, render: renderWidget, reset: resetWidget, delete: deleteFile }] as const;
};
