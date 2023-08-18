import styled from '@emotion/styled';

import _upperFirst from 'lodash/upperFirst';
import { useState } from 'react';
import { borders } from 'src/style';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { CommonPostAttachmentFragment } from 'src/gql/post.generated';
import { AttachmentType } from 'src/types/types.generated';
import { FullScreenAttachment } from 'src/components/full-screen-attachment';

type Props = {
	attachment: CommonPostAttachmentFragment;
};

export const Attachment = (props: Props) => {
	const { attachment } = props;

	const [isFullScreen, setIsFullScreen] = useState(false);

	const handleSwitchMode = () => {
		setIsFullScreen(!isFullScreen);
	};

	switch (attachment.type) {
		case AttachmentType.Image:
			return (
				<>
					{isFullScreen && attachment.image?.fileId && (
						<FullScreenAttachment fileId={attachment.image?.fileId} onClose={handleSwitchMode} />
					)}
					<Image
						className="cursor-pointer"
						onClick={handleSwitchMode}
						src={getOptimizedFileUrl(attachment.image?.fileId || '')}
						data-testid={`DaoFeed__post${_upperFirst(attachment.type)}`}
					/>
				</>
			);
		default:
			return null;
	}
};

const Image = styled.img`
	max-width: 100%;
	max-height: 520px;
	min-height: 100px;
	background-color: #c4c4c4;
	border-radius: ${borders.medium};
`;
