import { useMemo, ReactElement, useState } from 'react';
import cn from 'classnames';
import upperFirst from 'lodash/upperFirst';

import { useTranslation } from 'next-i18next';
import copy from 'clipboard-copy';

import { UseMutateFunction } from 'react-query';

import { BanIcon, Body, Caption, CopyIcon, DropdownMenu, Label1, toast, UserAvatar } from 'src/components';
import { colors } from 'src/style';

import { shrinkWallet } from '@sd/superdao-shared';
import { DaoWhitelistRowProps } from './daoWhitelistRow';
import { WhitelistStatusEnum } from 'src/types/types.generated';
import { UpdateWhitelistStatusMutationVariables } from 'src/gql/whitelist.generated';

type OptionsProps = {
	label: string;
	before: ReactElement;
	onClick: () => void | Promise<void>;
};

type DaoWhitelistEmailsRowProps = {
	action: UseMutateFunction<unknown, unknown, UpdateWhitelistStatusMutationVariables>;
};

export const DaoWhitelistEmailsRow = (props: DaoWhitelistRowProps & DaoWhitelistEmailsRowProps) => {
	const { member, currentUserMemberRole, isClaimed, tiers, action } = props;
	const { walletAddress, tiers: memberTiers, email } = member;

	const tierName = tiers?.[memberTiers?.[0]] || memberTiers?.[0] || '';
	const isCurrentUserAdmin = currentUserMemberRole === 'Creator';
	const userShrinkWallet = shrinkWallet(walletAddress);

	//Для реалтайм отображения после дизейбла ссылки
	const [linkStatus, setLinkStatus] = useState<WhitelistStatusEnum>(member.status);

	const { t } = useTranslation();

	const actionOptions = useMemo(() => {
		const options: OptionsProps[] = [
			...(walletAddress
				? [
						{
							label: t('pages.dao.members.actions.copyAddress'),
							before: <CopyIcon width={24} height={24} />,
							onClick: () =>
								copy(walletAddress).then(() => {
									toast(t('actions.confirmations.addressCopy'), { id: `dao-whitelist-wallet-${walletAddress}-copy` });
								})
						}
				  ]
				: [])
		];

		if (isCurrentUserAdmin && member.status !== WhitelistStatusEnum.Used) {
			const text =
				linkStatus === WhitelistStatusEnum.Enabled
					? t('pages.dao.members.actions.deactivateLink')
					: t('pages.dao.members.actions.activateLink');

			const nextStatus =
				linkStatus === WhitelistStatusEnum.Enabled ? WhitelistStatusEnum.Disabled : WhitelistStatusEnum.Enabled;

			options.push({
				label: text,
				before: <BanIcon width={24} height={24} />,
				onClick: () =>
					action(
						{ updateWhitelistStatusData: { id: member.id, status: nextStatus } },
						{
							onSuccess: () => {
								setLinkStatus(nextStatus);
							}
						}
					)
			});
		}

		return options;
	}, [walletAddress, t, isCurrentUserAdmin, member.status, member.id, linkStatus, action]);

	const textByStatus =
		linkStatus === WhitelistStatusEnum.Disabled
			? t('pages.dao.members.rows.linkDeactivated')
			: userShrinkWallet || t('pages.dao.members.rows.notClaimed');

	const NOT_CLAIMED_TEXT = t('pages.dao.members.notClaimed');
	const imageUrl = isClaimed ? undefined : '/assets/unclaimed.png';

	return (
		<div
			className={cn('lg:hover:bg-overlaySecondary relative flex items-center rounded-lg py-2.5 lg:py-2 lg:px-3', {
				'cursor-pointer': isClaimed,
				'cursor-not-allowed': !isClaimed
			})}
		>
			<div className="flex w-1/2 items-center">
				<UserAvatar src={imageUrl} className="mr-4" size="xs" seed={walletAddress} />

				<div>
					<Label1 className="w-full truncate" color={isClaimed ? colors.foregroundPrimary : colors.foregroundSecondary}>
						{email}
					</Label1>

					<div className="flex lg:hidden">
						<Caption className="block truncate opacity-60" data-testid="DaoMembers__userRole">
							{userShrinkWallet || NOT_CLAIMED_TEXT}
						</Caption>

						{tierName ? (
							<Caption className="ml-1 block truncate opacity-60" data-testid="DaoMembers__userTier">
								{`· ${upperFirst(tierName)}`}
							</Caption>
						) : null}
					</div>
				</div>
			</div>

			<Body className="block flex-1 truncate pr-4 opacity-60">{upperFirst(tierName)}</Body>
			<Body className="block flex-1 truncate pr-9 opacity-60">{textByStatus}</Body>

			{actionOptions.length > 0 && (
				<div className="absolute right-0 top-1/2 -translate-y-2/4 lg:right-3">
					<DropdownMenu options={actionOptions} />
				</div>
			)}
		</div>
	);
};
