import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import { useMemo } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { Label1, Title3 } from 'src/components/text';
import { colors } from 'src/style';
import type { Owners as OwnersClass } from 'src/types/types.generated';
import { UserAvatar } from 'src/components/common/avatar';
import { shrinkWallet } from '@sd/superdao-shared';

export type OwnersProps = {
	owners: OwnersClass[];
	collectionAddress: string;
	slug: string;
	tier: string;
	wrapperClassName?: string;
	isMobile: boolean;
};

const MAX_VISIBLE_OWNERS = 8;

export const Owners = (props: OwnersProps) => {
	const { owners, collectionAddress, slug, tier, wrapperClassName, isMobile } = props;
	const { asPath } = useRouter();
	const { t } = useTranslation();

	const visibleOwners = useMemo(
		() => (owners.length > MAX_VISIBLE_OWNERS ? [...(owners ?? [])].slice(0, MAX_VISIBLE_OWNERS) : owners),
		[owners]
	);

	return (
		<div className={wrapperClassName}>
			<div className="mb-2 flex justify-between px-3 pt-5">
				<div className="flex items-center gap-2">
					<Title3>{t('components.owners.title')}</Title3>
					{!!owners.length && <Title3 color={colors.foregroundTertiary}>{owners.length}</Title3>}
				</div>
				<Link href={`/${slug}/${tier}/owners?from=${asPath}`} passHref>
					<Label1 className="cursor-pointer" color={colors.accentPrimary}>
						{t('components.achievements.details.owners.viewAll')}
					</Label1>
				</Link>
			</div>

			<div className="grid gap-2 sm:grid-cols-2">
				{visibleOwners.map((owner) => (
					<OwnerItem
						key={owner.tokenId}
						slug={slug}
						owner={owner}
						collectionAddress={collectionAddress}
						isMobile={isMobile}
					/>
				))}
			</div>
		</div>
	);
};

type OwnerItemProps = Pick<OwnersProps, 'collectionAddress' | 'slug'> & { owner: OwnersClass; isMobile: boolean };

const OwnerItem = ({ owner, slug, isMobile }: OwnerItemProps) => {
	const { avatar, displayName, id, walletAddress, ens } = owner;

	return (
		<Link href={`/${slug}/members/${id}?fromNft=1`} passHref>
			<div className="hover:bg-overlaySecondary flex cursor-pointer flex-row items-center justify-between gap-2 rounded-lg px-3 py-1.5 last:mb-0">
				<div className="flex grow flex-row items-center gap-4 overflow-hidden">
					<UserAvatar size={isMobile ? 'xs' : 'md'} seed={id} fileId={avatar} />

					<div className="min-w-0 grow" data-testid="NftCard__memberInfo">
						<Label1
							className={cn('w-full truncate', { 'max-w-[260px]': isMobile })}
							data-testid="NftCard__memberWallet"
						>
							{displayName || ens || shrinkWallet(walletAddress)}
						</Label1>
					</div>
				</div>
			</div>
		</Link>
	);
};
