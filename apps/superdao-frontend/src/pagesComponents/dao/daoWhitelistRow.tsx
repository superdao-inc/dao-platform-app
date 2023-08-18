import { useMemo, ReactElement } from 'react';

import { useTranslation } from 'next-i18next';
import copy from 'clipboard-copy';

import cn from 'classnames';
import { BanMemberModal } from './banMemberModal';

import { BanIcon, Body, Caption, CopyIcon, DropdownMenu, Label1, toast, UserAvatar } from 'src/components';
import { colors } from 'src/style';

import { useSwitch } from 'src/hooks';
import { DaoMemberRole } from 'src/types/types.generated';
import { PublicWhitelistFragment } from 'src/gql/whitelist.generated';
import { shrinkWallet } from '@sd/superdao-shared';
import { isAdmin } from 'src/utils/roles';

type OptionsProps = {
	label: string;
	before: ReactElement;
	onClick: () => void | Promise<void>;
};

export type DaoWhitelistRowProps = {
	daoAddress: string;
	member: PublicWhitelistFragment;
	currentUserMemberRole?: DaoMemberRole;
	isClaimed?: boolean;
	daoId: string;
	tiers?: {
		[k: string]: string;
	};
};

export const DaoWhitelistRow = (props: DaoWhitelistRowProps) => {
	const { daoAddress, member, currentUserMemberRole, isClaimed, daoId, tiers } = props;
	const { walletAddress, tiers: memberTiers } = member;

	const isCurrentUserAdmin = isAdmin(currentUserMemberRole);
	const settedTiers = memberTiers?.map((tierId) => tiers?.[tierId] || tierId);

	const userShrinkWallet = shrinkWallet(walletAddress);

	const { t } = useTranslation();

	const [isBanModalOpen, { on: handleOpenBanModal, off: handleCloseBanModal }] = useSwitch(false);

	const actionOptions = useMemo(() => {
		const options: OptionsProps[] = [
			{
				label: t('pages.dao.members.actions.copyAddress'),
				before: <CopyIcon width={24} height={24} />,
				onClick: () =>
					copy(walletAddress).then(() => {
						toast(t('actions.confirmations.addressCopy'), { id: 'dao-row-wallet-address-copy' });
					})
			}
		];

		if (isCurrentUserAdmin) {
			options.push({
				label: t('pages.dao.members.actions.remove'),
				before: <BanIcon width={24} height={24} />,
				onClick: handleOpenBanModal
			});
		}

		return options;
	}, [t, walletAddress, isCurrentUserAdmin, handleOpenBanModal]);

	const imageUrl = isClaimed ? undefined : '/assets/unclaimed.png';

	return (
		<div
			className={cn(
				'lg:hover:bg-overlaySecondary relative flex items-center justify-between rounded-lg py-2.5 lg:py-2 lg:px-3',
				{
					'cursor-pointer': isClaimed,
					'cursor-not-allowed': !isClaimed
				}
			)}
		>
			<div className="flex w-1/2 grow-0 items-center">
				<UserAvatar src={imageUrl} className="mr-4" size="xs" seed={walletAddress} />

				<div className="overflow-hidden">
					<Label1 color={isClaimed ? colors.foregroundPrimary : colors.foregroundSecondary}>{userShrinkWallet}</Label1>

					<Caption className="block truncate opacity-60 lg:hidden">{settedTiers?.join(',') || 'All tiers'}</Caption>
				</div>
			</div>

			<Body className="hidden flex-1 truncate opacity-60 lg:block">{settedTiers?.join(',') || 'All tiers'}</Body>

			{actionOptions.length > 0 && <DropdownMenu options={actionOptions} />}

			{isBanModalOpen && (
				<BanMemberModal
					daoId={daoId}
					isOpen={isBanModalOpen}
					userName={userShrinkWallet}
					onClose={handleCloseBanModal}
					daoAddress={daoAddress}
					banType="whitelist"
					userId={member.id}
				/>
			)}
		</div>
	);
};
