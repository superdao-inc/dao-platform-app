import { useRouter } from 'next/router';
import { MouseEvent } from 'react';

import { LogoutIcon } from 'src/components/assets/icons';
import { UserAvatar } from 'src/components/common/avatar';
import { Label2, SubHeading } from 'src/components/text';
import { AuthAPI } from 'src/features/auth/API';
import { useCurrentUserQuery } from 'src/gql/user.generated';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { shrinkWallet } from '@sd/superdao-shared';
import { PATH_PROFILE } from 'src/features/user/constants';
import { useWallet } from 'src/providers/walletProvider';

type Props = {
	withLogout?: boolean;
};

export const AuthorizedNavigationUserProfile = (props: Props) => {
	const { withLogout } = props;

	const { push } = useRouter();

	const { mutate: logout } = AuthAPI.useLogout();
	const { clear } = useWallet();

	const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUserQuery();
	const { currentUser } = currentUserData || {};

	const isLoading = isCurrentUserLoading;

	const handleRedirectToProfile = () => {
		push(PATH_PROFILE);
	};

	const handleLogout = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		logout({});
		clear();
	};

	if (isLoading) {
		return (
			<div className="hover:bg-overlaySecondary mx-3 mb-3 mt-auto hidden w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-all lg:flex">
				<SkeletonComponent variant="circular" className="h-10 w-10" />
				<div>
					<SkeletonComponent variant="rectangular" className="h-3 w-[150px]" />
					<SkeletonComponent variant="rectangular" className="mt-2 h-3 w-20" />
				</div>
			</div>
		);
	}

	return (
		<div
			onClick={handleRedirectToProfile}
			className="hover:bg-overlaySecondary relative mx-3 mb-3 mt-auto hidden w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-all lg:flex"
		>
			<UserAvatar seed={currentUser?.id} fileId={currentUser?.avatar} size="md" />
			<div>
				<Label2 className="truncate">
					{currentUser?.displayName || shrinkWallet(currentUser?.ens || currentUser?.walletAddress || '')}
				</Label2>
				<SubHeading className="text-foregroundSecondary">{shrinkWallet(currentUser?.walletAddress || '')}</SubHeading>
			</div>
			{withLogout && (
				<div
					onClick={handleLogout}
					className="hover:bg-overlayTertiary absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all"
				>
					<LogoutIcon width={20} height={20} />
				</div>
			)}
		</div>
	);
};
