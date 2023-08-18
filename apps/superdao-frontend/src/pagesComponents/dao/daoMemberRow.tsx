import React, { useCallback, useMemo, useRef } from 'react';

import upperFirst from 'lodash/upperFirst';
import { UseMutateFunction } from 'react-query';

import copy from 'clipboard-copy';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { nanoid } from 'nanoid';
import {
	BanIcon,
	Body,
	CopyIcon,
	DropdownMenu,
	Label1,
	SubHeading,
	UserAvatar,
	CrownIcon,
	Caption,
	MemberIcon,
	toast,
	Ellipsis
} from 'src/components';
import Tooltip from 'src/components/tooltip';

import { PublicDaoMembershipFragment } from 'src/gql/daoMembership.generated';
import { useSwitch } from 'src/hooks';
import { colors } from 'src/style';
import { DaoMemberRole } from 'src/types/types.generated';
import { getRoleTranslationKey } from 'src/utils/roles';
import { changeMemberRoleKey } from 'src/utils/toastKeys';
import { MetamaskError } from 'src/types/metamask';
import { GrantMemberRoleTxQueryVariables, RevokeMemberRoleTxQueryVariables } from 'src/gql/transaction.generated';
import { shrinkWallet } from '@sd/superdao-shared';
import { BanMemberModal } from './banMemberModal';
import { TooltipTiers } from './daoMemberRowTooltip';

export type MemberRowProps = {
	daoId: string;
	daoAddress: string;
	daoSlug: string;
	member: PublicDaoMembershipFragment;
	tiers: string[];
	currentUserId?: string;
	currentUserMemberRole?: DaoMemberRole;
	isClaimed: boolean;
	creatorExist: boolean;
	changeRoleActions: {
		grant: UseMutateFunction<unknown, Error, GrantMemberRoleTxQueryVariables>;
		revoke: UseMutateFunction<unknown, Error, RevokeMemberRoleTxQueryVariables>;
	};
};

export const DaoMemberRow = (props: MemberRowProps) => {
	const {
		daoId,
		daoAddress,
		daoSlug,
		member,
		tiers,
		currentUserMemberRole,
		currentUserId,
		creatorExist,
		isClaimed,
		changeRoleActions
	} = props;
	const toastId = useRef(nanoid(3));
	const { role, user } = member;
	const { displayName, slug, avatar, walletAddress, ens, id } = user;

	const userName = displayName || shrinkWallet(ens || walletAddress);

	const isCurrentUser = currentUserId === id;

	const { t } = useTranslation();

	const [isBanModalOpen, { on: handleOpenBanModal, off: handleCloseBanModal }] = useSwitch(false);

	const changeRole = useCallback(
		(role: DaoMemberRole, action: 'grant' | 'revoke') => {
			const actionByArg = changeRoleActions[action];

			toast.loading('Changing role', {
				position: 'bottom-center',
				id: changeMemberRoleKey(member.userId, daoId)
			});

			actionByArg(
				{ changeMemberRoleData: { daoAddress, userWalletAddress: walletAddress, role } },
				{
					onError: (error) => {
						toast.dismiss(changeMemberRoleKey(member.userId, daoId));
						let metamaskErrorMessage = t(`errors.metamask.${(error as MetamaskError).code}`, '');

						toast.error(metamaskErrorMessage || t('toasts.changeRole.fail'), {
							position: 'bottom-center',
							duration: 5000
						});
					}
				}
			);
		},
		[changeRoleActions, member.userId, daoId, daoAddress, walletAddress, t]
	);

	const actionOptions = useMemo(() => {
		const optionsObj = [
			{
				name: 'copy',
				available: [DaoMemberRole.Sudo, DaoMemberRole.Creator, DaoMemberRole.Admin, DaoMemberRole.Member],
				availableForRole: [DaoMemberRole.Sudo, DaoMemberRole.Creator, DaoMemberRole.Admin, DaoMemberRole.Member],
				option: {
					label: t('pages.dao.members.actions.copyAddress'),
					before: <CopyIcon width={24} height={24} />,
					onClick: () =>
						copy(walletAddress).then(() => toast(t('actions.confirmations.addressCopy'), { id: toastId.current }))
				}
			},
			{
				name: 'grantAdmin',
				available: [DaoMemberRole.Sudo, DaoMemberRole.Creator, DaoMemberRole.Admin],
				availableForRole: [DaoMemberRole.Member],
				option: {
					label: t(`pages.dao.members.actions.grantAdmin`),
					before: <CrownIcon width={24} height={24} />,
					onClick: () => changeRole(DaoMemberRole.Admin, 'grant')
				}
			},
			{
				name: 'revokeAdmin',
				available: [DaoMemberRole.Sudo, DaoMemberRole.Creator],
				availableForRole: [DaoMemberRole.Admin],
				option: {
					label: t(`pages.dao.members.actions.revokeAdmin`),
					before: <MemberIcon width={24} height={24} />,
					onClick: () => changeRole(DaoMemberRole.Member, 'revoke')
				}
			},
			{
				name: 'grantCreator',
				available: [DaoMemberRole.Sudo],
				availableForRole: [DaoMemberRole.Admin, DaoMemberRole.Member],
				condition: !creatorExist,
				option: {
					label: t(`pages.dao.members.actions.grantCreator`),
					before: <CrownIcon width={24} height={24} />,
					onClick: () => changeRole(DaoMemberRole.Creator, 'grant')
				}
			},
			{
				name: 'revokeCreator',
				available: [DaoMemberRole.Sudo],
				availableForRole: [DaoMemberRole.Creator],
				option: {
					label: t(`pages.dao.members.actions.revokeCreator`),
					before: <MemberIcon width={24} height={24} />,
					onClick: () => changeRole(DaoMemberRole.Member, 'revoke')
				}
			},
			{
				name: 'ban',
				available: [DaoMemberRole.Sudo, DaoMemberRole.Creator, DaoMemberRole.Admin],
				availableForRole: [DaoMemberRole.Member],
				condition: currentUserMemberRole !== role,
				option: {
					label: t('pages.dao.members.actions.ban'),
					before: <BanIcon width={24} height={24} />,
					onClick: handleOpenBanModal
				}
			}
		];

		const options: any[] = optionsObj
			.map((item) => {
				if (item.available.includes(currentUserMemberRole!) && item.availableForRole.includes(role)) {
					if (item.hasOwnProperty('condition') && !item.condition) return;
					return item.option;
				}
			})
			.filter((option) => !!option);

		return options;
	}, [t, creatorExist, currentUserMemberRole, role, handleOpenBanModal, walletAddress, changeRole]);

	const roleKey = getRoleTranslationKey(role);
	const tierName = tiers[0];
	const TooltipComponent = isClaimed
		? React.Fragment
		: (prop: any) => <Tooltip {...prop} content={<SubHeading>Unclaimed</SubHeading>} placement="bottom" followMouse />;

	const linkPath = isCurrentUser ? `/users/${slug || id}` : `/${daoSlug}/members/${slug || id}`;

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
				data-testid={`DaoMembers__${id}`}
			>
				<LinkComponent>
					<div className="flex w-1/2 items-center">
						<UserAvatar className="mr-4" size="xs" seed={id} src={avatarImage} data-testid="DaoMembers__userAvatar" />

						<div className="overflow-hidden">
							<Label1
								className="w-full truncate"
								color={isClaimed ? colors.foregroundPrimary : colors.foregroundSecondary}
								data-testid="DaoMembers__userName"
							>
								{userName}
							</Label1>

							<div className="flex lg:hidden">
								<Caption className="block truncate opacity-60" data-testid="DaoMembers__userRole">
									{t(roleKey)}
								</Caption>

								{tierName ? (
									<Caption className="ml-1 block truncate opacity-60" data-testid="DaoMembers__userTier">
										{`· ${upperFirst(tierName)}`}
									</Caption>
								) : null}
							</div>
						</div>
					</div>
				</LinkComponent>

				<LinkComponent>
					<Body className="hidden flex-1 truncate pr-4 opacity-60 lg:block" data-testid="DaoMembers__userRole">
						{t(roleKey)}
					</Body>
				</LinkComponent>

				<LinkComponent>
					<Body
						className="align-center hidden flex-1 truncate pr-9 opacity-60 lg:flex"
						data-testid="DaoMembers__userTier"
					>
						<Ellipsis shouldNotWidth as={Body}>
							{upperFirst(tierName)}
						</Ellipsis>
						{tiers.length > 1 && (
							<Tooltip className="ml-3" content={<TooltipTiers tiers={tiers} />} placement="left">
								<div className="bg-overlaySecondary flex h-6 min-w-[24px] items-center justify-center rounded-lg pl-1 pr-1">
									<Caption>+{tiers.length - 1}</Caption>
								</div>
							</Tooltip>
						)}
					</Body>
				</LinkComponent>

				{actionOptions.length > 0 && (
					<div className="absolute right-0 top-1/2 -translate-y-2/4 lg:right-3">
						<DropdownMenu options={actionOptions} data-testid="DaoMembers__userDropdown" />
					</div>
				)}

				{isBanModalOpen && (
					<BanMemberModal
						daoId={daoId}
						userId={id}
						isOpen={isBanModalOpen}
						userName={userName}
						onClose={handleCloseBanModal}
						daoAddress={daoAddress}
						banType="member"
					/>
				)}
			</a>
		</TooltipComponent>
	);
};
