import { ReactNode } from 'react';
import cn from 'classnames';

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { OutlineLockIcon } from 'src/components/assets/icons';
import { Label1 } from 'src/components/text';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { CustomLink } from 'src/components';
import { DaoPageNavigationTab } from './daoPageNavigationTab';
import { useSwitch } from 'src/hooks';
import { NewAudienceModal } from 'src/components/modals/newAudienceModal';
import { formatToCompactNotation } from 'src/utils/formattes';

type Props = {
	content: string | ReactNode;
	isActive: boolean;
	isLocked?: boolean;
	toggleIsNavigationShown?: () => void;
	isSkeletonMode?: boolean;
	canBeLocked?: boolean;
	counter?: number;
};

const NestedTab = (props: Props) => {
	const { content, isActive, isLocked, toggleIsNavigationShown, isSkeletonMode, canBeLocked, counter } = props;

	const tabContent =
		typeof content === 'string' ? (
			<div className="flex w-full justify-between">
				<Label1 className={cn('truncate pl-[36px]', { 'text-foregroundSecondary': isLocked || !isActive })}>
					{content}
				</Label1>
				{!isLocked && counter && (
					<Label1 className={cn('text-foregroundTertiary')}>{formatToCompactNotation(counter)}</Label1>
				)}
			</div>
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
					{isSkeletonMode ? <SkeletonComponent variant="rectangular" className="h-4 w-full" /> : tabContent}
					{isSkeletonMode ? lockedSkeleton : lockedContent}
				</div>
			</div>
		</>
	);
};

type TabProps = {
	navigationTab: {
		link: string;
		icon: ReactNode;
		content: string | ReactNode;
		isActive: boolean;
		isLocked: boolean;
		canBeLocked: boolean;
		achievementLevel: ReactNode;
		children: {
			link: string;
			content: string;
			isActive: boolean;
			isLocked: boolean;
			canBeLocked: boolean;
			isShown: boolean;
			counter?: number;
		}[];
	};
	isLoading: boolean;
	toggleIsNavigationShown: () => void;
};

export const NestedNavigation = ({ navigationTab, isLoading, toggleIsNavigationShown }: TabProps) => {
	const { pathname } = useRouter();

	return (
		<>
			<CustomLink href={navigationTab.link} pathname={pathname} passHref>
				{(_highlighted) => {
					return (
						<a className="w-full">
							<DaoPageNavigationTab
								icon={navigationTab.icon}
								content={navigationTab.content}
								isActive={navigationTab.isActive}
								isLocked={navigationTab.isLocked}
								canBeLocked={navigationTab.canBeLocked}
								toggleIsNavigationShown={toggleIsNavigationShown}
								isSkeletonMode={isLoading}
								achievementLevel={navigationTab.achievementLevel}
							/>
						</a>
					);
				}}
			</CustomLink>
			<div className="mt-2 flex h-max flex-wrap items-start gap-2">
				{navigationTab.children.map((nestedTab) => (
					<div
						key={nestedTab.link}
						className={cn('w-full', !nestedTab.isShown && 'hidden')}
						data-testid={`DaoMenu__${nestedTab.content}`}
					>
						<CustomLink href={nestedTab.link} pathname={pathname} passHref>
							{(_highlighted) => {
								return nestedTab.isShown ? (
									<a className="w-full">
										<NestedTab
											content={nestedTab.content}
											isActive={nestedTab.isActive}
											isLocked={nestedTab.isLocked}
											canBeLocked={nestedTab.canBeLocked}
											toggleIsNavigationShown={toggleIsNavigationShown}
											isSkeletonMode={isLoading}
											counter={nestedTab.counter}
										/>
									</a>
								) : (
									<></>
								);
							}}
						</CustomLink>
					</div>
				))}
			</div>
		</>
	);
};
