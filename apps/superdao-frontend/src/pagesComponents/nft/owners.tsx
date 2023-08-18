import styled from '@emotion/styled';

import Link from 'next/link';
import copy from 'clipboard-copy';
import { useTranslation } from 'next-i18next';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Body, Label1, Title3 } from 'src/components/text';
import { colors, translations, transitions } from 'src/style';
import { openExternal, getOpenseaNftUrl } from 'src/utils/urls';
import type { Owners as OwnersClass } from 'src/types/types.generated';
import { ChevronRight } from 'src/components/assets/icons/chevron-right';
import { UserAvatar } from 'src/components/common/avatar';
import { DropdownMenu } from 'src/components';
import { CopyIcon } from 'src/components/assets/icons/copy';
import { OpenseaOutlineIcon } from 'src/components/assets/icons/openseaOutline';
import { toast } from 'src/components';
import cn from 'classnames';
import { shrinkWallet } from '@sd/superdao-shared';
import { DownloadOwnersData } from './downloadOwnersData';

export type OwnersProps = {
	owners: OwnersClass[];
	collectionAddress: string;
	slug: string;
	tier: string;
	isLimited?: boolean;
};

const MAX_VISIBLE_OWNERS = 5;

export const Owners = (props: OwnersProps) => {
	const { owners, collectionAddress, slug, tier, isLimited } = props;

	const { t } = useTranslation();
	const { push } = useRouter();

	const visibleOwners = useMemo(
		() => (isLimited ? [...(owners ?? [])].slice(0, MAX_VISIBLE_OWNERS) : owners),
		[owners, isLimited]
	);

	const openOwners = () => owners?.length > MAX_VISIBLE_OWNERS && push(`/${slug}/${tier}/owners`);

	return (
		<>
			{isLimited && (
				<div className="mb-4 flex justify-between sm:mb-2 sm:px-6">
					<FlexWrap
						clickable={!!owners.length && owners.length > MAX_VISIBLE_OWNERS && Boolean(isLimited)}
						onClick={openOwners}
						data-testid="NftCard__owners"
					>
						<Title3>{t('components.owners.title')}</Title3>
						{!!owners.length && (
							<>
								<Title3 color={colors.foregroundTertiary}>{owners.length}</Title3>
								{owners.length > MAX_VISIBLE_OWNERS && <ChevronRight />}
							</>
						)}
					</FlexWrap>
					{!!owners.length && <DownloadOwnersData owners={owners} />}
				</div>
			)}
			<div
				className={cn('bg-backgroundSecondary  rounded-lg ', {
					'mx-0 sm:mx-3': isLimited
				})}
			>
				{visibleOwners.length > 0 ? (
					visibleOwners.map((owner) => (
						<OwnerItem key={owner.tokenId} slug={slug} owner={owner} collectionAddress={collectionAddress} />
					))
				) : (
					<Body className="px-3 py-6">{t('pages.nft.notSent')}</Body>
				)}
			</div>
		</>
	);
};

type OwnerItemProps = Pick<OwnersProps, 'collectionAddress' | 'slug'> & { owner: OwnersClass };

const OwnerItem = ({ owner, collectionAddress, slug }: OwnerItemProps) => {
	const { avatar, displayName, id, tokenId, walletAddress, ens } = owner;

	const { t } = useTranslation();

	const openseaUrl = getOpenseaNftUrl(collectionAddress, tokenId);
	const handleViewOpensea = useCallback(() => openExternal(openseaUrl), [openseaUrl]);
	const handleCopy = useCallback(
		() => copy(tokenId).then(() => toast(t('actions.confirmations.nftIdCopy'), { id: `token-${tokenId}-copy` })),
		[tokenId, t]
	);

	const options = useMemo(
		() => [
			{
				label: t('actions.labels.viewOpensea'),
				before: <OpenseaOutlineIcon height={20} width={20} />,
				onClick: handleViewOpensea
			},
			{
				label: t('actions.labels.copyNftId'),
				before: <CopyIcon height={20} width={20} />,
				onClick: handleCopy
			}
		],
		[t, handleCopy, handleViewOpensea]
	);

	return (
		<Link href={`/${slug}/members/${id}?fromNft=1`} passHref>
			<div className="hover:bg-overlaySecondary flex cursor-pointer flex-row items-center justify-between gap-2 rounded-lg px-3 py-1.5 last:mb-0">
				<div className="flex grow flex-row items-center gap-4 overflow-hidden">
					<UserAvatar className="hidden lg:block" size="md" seed={id} fileId={avatar} />
					<UserAvatar className="block lg:hidden" size="xs" seed={id} fileId={avatar} />

					<div className="min-w-0 grow" data-testid="NftCard__memberInfo">
						<Label1 className="w-full truncate" data-testid="NftCard__memberWallet">
							{displayName || ens || shrinkWallet(walletAddress)}
						</Label1>
					</div>
				</div>
				<DropdownMenu shouldCloseOnSelect options={options} />
			</div>
		</Link>
	);
};

const FlexWrap = styled.div<{ clickable: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;

	svg {
		transition: ${transitions[300]};
	}

	${({ clickable }) =>
		clickable &&
		`
		cursor: pointer;

		&:hover svg {
			transform: ${translations.horisontal(5)};
			transition: ${transitions[300]};
		}
	`}
`;
