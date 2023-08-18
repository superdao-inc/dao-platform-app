import { HTMLAttributes } from 'react';

import { Avatar, UserAvatar } from 'src/components/common/avatar';
import { Body, Title3 } from 'src/components/text';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

type Props = {
	isSkeletonMode: boolean;
	avatar?: string | null;
	main?: string;
	additional?: any;
	id?: string;
	isUser?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const NavigationMetaInfo = (props: Props) => {
	const { isSkeletonMode, avatar, main, id, additional, isUser, className, ...rest } = props;

	if (isSkeletonMode) {
		return (
			<div className={`m-6 flex items-center gap-3 ${className}`} {...rest}>
				<SkeletonComponent variant="circular" className="h-14 w-14" />
				<div>
					<SkeletonComponent variant="rectangular" className="h-4 w-[150px]" />
					<SkeletonComponent variant="rectangular" className="mt-2 h-4 w-20" />
				</div>
			</div>
		);
	}

	return (
		<div
			className={`relative m-6 flex w-[calc(100%-48px)] items-center gap-3 ${className}`}
			data-testid={isUser ? 'ProfileMenu__userBlock' : 'DaoMenu__daoBlock'}
			{...rest}
		>
			{isUser ? (
				<UserAvatar seed={id} fileId={avatar} size="lg" data-testid={'ProfileMenu__userBlockAvatar'} />
			) : (
				<Avatar seed={id} fileId={avatar} size="lg" data-testid={'DaoMenu__userBlockAvatar'} />
			)}
			<div className="relative w-[calc(100%-56px-12px)]">
				<Title3 className=" truncate" data-testid={isUser ? 'ProfileMenu__userBlockName' : 'DaoMenu__daoBlockName'}>
					{main}
				</Title3>
				<Body
					className="text-foregroundSecondary"
					data-testid={isUser ? 'ProfileMenu__userBlockWallet' : 'DaoMenu__daoBlockMembers'}
				>
					{additional}
				</Body>
			</div>
		</div>
	);
};
