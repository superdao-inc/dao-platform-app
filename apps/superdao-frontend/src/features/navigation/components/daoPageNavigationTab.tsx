import { ReactNode } from 'react';
import cn from 'classnames';

import { OutlineLockIcon } from 'src/components/assets/icons';
import { Label1 } from 'src/components/text';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

type Props = {
	icon: ReactNode;
	content: string | ReactNode;
	isActive: boolean;
	isLocked?: boolean;
	toggleIsNavigationShown?: () => void;
	isSkeletonMode?: boolean;
	canBeLocked?: boolean;
	achievementLevel?: ReactNode | boolean;
};

export const DaoPageNavigationTab = (props: Props) => {
	const { icon, content, isActive, isLocked, toggleIsNavigationShown, isSkeletonMode, canBeLocked, achievementLevel } =
		props;

	const tabContent =
		typeof content === 'string' ? (
			<Label1 className={cn('truncate', { 'text-foregroundSecondary': isLocked })}>{content}</Label1>
		) : (
			content
		);

	const lockedContent = isLocked && (
		<OutlineLockIcon className="absolute right-[14px] top-[14px]" width={16} height={16} />
	);

	const lockedSkeleton = canBeLocked ? <SkeletonComponent variant="circular" className="h-4 w-4 shrink-0" /> : null;

	return (
		<>
			<div className="flex">
				<div
					className={`${
						isActive ? 'bg-overlaySecondary' : ''
					} hover:bg-overlaySecondary relative flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-all`}
					onClick={toggleIsNavigationShown}
				>
					{isSkeletonMode ? <SkeletonComponent variant="circular" className="h-6 w-6 shrink-0" /> : icon}
					{isSkeletonMode ? <SkeletonComponent variant="rectangular" className="h-4 w-full" /> : tabContent}
					{isSkeletonMode ? lockedSkeleton : lockedContent}
					{achievementLevel}
				</div>
			</div>
		</>
	);
};
