import React, { HTMLAttributes } from 'react';
import Blockies from 'react-blockies';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { getOptimizedFileUrl } from 'src/utils/upload';
import { colors } from 'src/style';
import { generateCoverGradient } from 'src/utils/cover-generator';

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type AvatarSize = Sizes | string;

type Props = HTMLAttributes<HTMLDivElement> & {
	size: AvatarSize;
	isOnline?: boolean;
	src?: string;
	fileId?: string | null;
	seed?: string;
};

const sizes: Record<AvatarSize, { avatar: string; indicator: string }> = {
	xxs: { avatar: '20', indicator: '0' },
	xs: { avatar: '24', indicator: '0' },
	sm: { avatar: '32', indicator: '6' },
	md: { avatar: '40', indicator: '8' },
	lg: { avatar: '56', indicator: '8' },
	xl: { avatar: '72', indicator: '10' },
	xxl: { avatar: '96', indicator: '12' }
};

const indicatorBorderWidth = 2;

const BaseAvatar: React.FC<Props> = (props) => {
	const { size, isOnline, src, fileId, seed, children, ...rest } = props;

	const avatarSize = sizes[size]?.avatar ?? size;
	const onlineIndicatorSize = sizes[size]?.indicator ?? Math.round(+avatarSize / 8);
	const indicatorPosition = +avatarSize * Math.sin(220) - indicatorBorderWidth;

	return (
		<AvatarElement {...rest}>
			<Wrapper size={avatarSize} data-testid={'Avatar__wrapper'}>
				{children}
				{isOnline && <Indicator position={indicatorPosition} size={onlineIndicatorSize} />}
			</Wrapper>
		</AvatarElement>
	);
};

const errorImg = (source: any) => {
	source.target.src = '/assets/broken-image-avatar.jpg';
};

export const Avatar = (props: Props) => {
	const { fileId, src, seed, ...rest } = props;

	const imageUrl = fileId ? getOptimizedFileUrl(fileId) : src;

	return (
		<BaseAvatar {...rest}>
			<Image
				src={imageUrl}
				onError={(e) => {
					errorImg(e);
				}}
				seed={seed}
				data-testid={'Avatar__image'}
			/>
		</BaseAvatar>
	);
};

//
// todo combine Avatar и UserAvatar
//

export const UserAvatar = (props: Props) => {
	const { fileId, src, seed, ...rest } = props;

	const imageUrl = fileId ? getOptimizedFileUrl(fileId) : src;

	return (
		<BaseAvatar {...rest}>
			{imageUrl ? (
				<Image
					src={imageUrl}
					onError={(e) => {
						errorImg(e);
					}}
					seed={seed}
					data-testid={'UserAvatar__image'}
				/>
			) : (
				<Blockies css={blockiesStyles} seed={seed || ''} />
			)}
		</BaseAvatar>
	);
};

const AvatarElement = styled.div``;

const Wrapper = styled.div<Props>`
	display: block;
	width: ${(props) => props.size}px;
	height: ${(props) => props.size}px;
	position: relative;
	border-radius: 50%;
`;

const Image = styled.img<Pick<Props, 'seed'>>`
	width: 100%;
	height: 100%;
	border-radius: 50%;
	object-fit: cover;
	object-position: center;

	&:not([src]) {
		background: ${({ seed }) => (seed ? generateCoverGradient(seed.split('').reverse().join()) : 'peachpuff')};
		/* https://stackoverflow.com/a/36367724/8428436 */
		content: url('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
	}
`;

const blockiesStyles = css`
	width: 100% !important;
	height: 100% !important;
	border-radius: 50%;
`;

const Indicator = styled.div<{ size: string | number; position: number }>`
	position: absolute;
	bottom: ${({ position }) => position}px;
	right: ${({ position }) => position}px;
	width: ${({ size }) => size}px;
	height: ${({ size }) => size}px;
	background-color: ${colors.activeIndicator};
	border: ${indicatorBorderWidth}px solid ${colors.backgroundPrimary};
	border-radius: 50%;
`;
