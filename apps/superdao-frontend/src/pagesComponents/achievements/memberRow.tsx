import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import Link from 'next/link';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { Body, Label1, SubHeading, UserAvatar, Ellipsis } from 'src/components';
import Tooltip from 'src/components/tooltip';

import { shrinkWallet } from '@sd/superdao-shared';
import { getRoleTranslationKey } from 'src/utils/roles';
import { colors } from 'src/style';
import { LevelComponent } from './shared/level';
import { DaoMemberRole } from 'src/types/types.generated';
import { AchievementUserFragment, AchievementNftFragment } from 'src/gql/achievements.generated';
import { TooltipAchievements } from './achievementsTooltip';

export type MemberRowProps = {
	daoSlug: string;
	member: {
		level: number;
		role: DaoMemberRole;
		roadmapLevelsCount: number;
		user: AchievementUserFragment;
		achievementNFTs: AchievementNftFragment[];
		achievementNFTsCount: number;
		xp: number;
	};
	isClaimed: boolean;
};

export const MemberRow = (props: MemberRowProps) => {
	const { t } = useTranslation();

	const { daoSlug, member, isClaimed } = props;
	const { user } = member;
	const { displayName, slug, avatar, walletAddress, ens, id } = user;

	const userName = displayName || shrinkWallet(ens || walletAddress);

	const TooltipComponent = isClaimed
		? React.Fragment
		: (prop: any) => <Tooltip {...prop} content={<SubHeading>Unclaimed</SubHeading>} placement="bottom" followMouse />;

	const linkPath = `/${daoSlug}/achievements/leaderboard/${slug || id}`;

	const LinkComponent = isClaimed ? (prop: any) => <Link {...prop} href={linkPath} passHref /> : React.Fragment;

	const avatarImage = useMemo(() => {
		if (isClaimed) {
			return avatar ? getOptimizedFileUrl(avatar) : undefined;
		}
		return '/assets/unclaimed.png';
	}, [isClaimed, avatar]);

	return (
		<TooltipComponent>
			<a
				className={cn('lg:hover:bg-overlaySecondary relative flex items-center rounded-lg py-2.5 lg:py-2 lg:px-3', {
					'cursor-pointer': isClaimed,
					'cursor-not-allowed': !isClaimed
				})}
			>
				<LinkComponent>
					<div className="flex grow-0 basis-8/12 items-center truncate lg:basis-2/5">
						<UserAvatar className="mr-4" size="xs" seed={id} src={avatarImage} />

						<div className="overflow-hidden">
							<Label1
								color={isClaimed ? colors.foregroundPrimary : colors.foregroundSecondary}
								className="w-full truncate"
							>
								{userName}
							</Label1>
							<Body className="flex-1 truncate opacity-60 lg:hidden">{t(getRoleTranslationKey(member.role))}</Body>
						</div>
					</div>
				</LinkComponent>

				<LinkComponent>
					<Body className="hidden flex-1 truncate opacity-60 lg:block">{t(getRoleTranslationKey(member.role))}</Body>
				</LinkComponent>

				<LinkComponent>
					<Body className="flex flex-1 basis-1/12 justify-end truncate opacity-60 lg:basis-0">
						<Tooltip
							content={<TooltipAchievements achievementNFTs={member.achievementNFTs} />}
							placement="top"
							isVisible={member.achievementNFTsCount > 0}
						>
							<Ellipsis shouldNotWidth as={Body}>
								{member.xp}
							</Ellipsis>
						</Tooltip>
					</Body>
				</LinkComponent>

				<LinkComponent>
					<div className="flex-1 basis-1/12 lg:basis-0">
						<LevelComponent level={member.level} />
					</div>
				</LinkComponent>
			</a>
		</TooltipComponent>
	);
};
