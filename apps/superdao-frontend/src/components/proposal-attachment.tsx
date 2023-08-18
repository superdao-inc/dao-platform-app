import styled from '@emotion/styled';

import { HTMLAttributes, MouseEvent, useState } from 'react';
import { borders } from 'src/style';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { FullScreenAttachment } from 'src/components/full-screen-attachment';

type Props = {
	attachmentId: string;
} & HTMLAttributes<HTMLDivElement>;

export const ProposalAttachment = ({ attachmentId }: Props) => {
	const [isFullScreen, setIsFullScreen] = useState(false);

	const handleSwitchMode = (e: MouseEvent) => {
		e.stopPropagation();
		setIsFullScreen(!isFullScreen);
	};

	return (
		<>
			{isFullScreen && <FullScreenAttachment fileId={attachmentId} onClose={handleSwitchMode} />}
			<Image
				className="cursor-pointer lg:max-h-[260px] lg:max-w-[520px]"
				onClick={handleSwitchMode}
				src={getOptimizedFileUrl(attachmentId)}
				data-testid={'ProposalAttachment__image'}
			/>
		</>
	);
};

const Image = styled.img`
	max-width: 100%;
	max-height: 520px;
	min-height: 100px;
	background-color: #c4c4c4;
	border-radius: ${borders.medium};
`;
