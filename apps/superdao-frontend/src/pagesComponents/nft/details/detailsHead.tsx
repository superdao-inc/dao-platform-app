import { useMemo } from 'react';
import cn from 'classnames';
import upperFirst from 'lodash/upperFirst';
import { useTranslation } from 'next-i18next';
import { getNftTypeData } from 'src/constants';
import { Caption, Label2, Title2 } from 'src/components';
import { CollectionTierInfo } from 'src/types/types.generated';
import { colors } from 'src/style';
import { formatAmountNftString } from 'src/utils/formattes';
import Tooltip from 'src/components/tooltip';
import { UserDetail, UserDetailProps } from './userDetail';
import { Amount } from './types';
import { ShareDropdown } from './shareDropdown';

type Props = {
	collectionName?: string;
	tierName?: string | null;
	tierArtworkType?: CollectionTierInfo['tierArtworkType'];
	amount?: Amount;
	creator?: UserDetailProps;
	owner?: UserDetailProps;
	daoName?: string;
	isSharingEnabled?: boolean;
	fullUrl?: string;
	isCurrentUser?: boolean;
};

const tierNameMaxLength = 14;

export const DetailsHead = ({
	collectionName = '',
	tierName = '',
	isSharingEnabled,
	fullUrl,
	daoName,
	tierArtworkType,
	creator,
	owner,
	isCurrentUser,
	amount
}: Props) => {
	const { t } = useTranslation();

	const { TierArtworkTypeIcon, ...tierType } = useMemo(() => getNftTypeData(tierArtworkType, true), [tierArtworkType]);

	const amountNftLabel = useMemo<string | null>(() => {
		if (!amount?.maxAmount) return null;

		const amountString = formatAmountNftString(amount.maxAmount, amount.totalAmount);

		return `${amountString} ${t('pages.nft.available')}`;
	}, [amount, t]);

	return (
		<div>
			<div className="mb-4 flex items-start justify-between">
				{collectionName && (
					<>
						<div
							className={cn('line-clamp-2 mr-2', { 'mt-1': isSharingEnabled })}
							data-testid="NftCard__collectionName"
						>
							<Label2>
								{upperFirst(collectionName)} {t('pages.nft.collection')}
							</Label2>
						</div>
						{isSharingEnabled && (
							<ShareDropdown
								size="md"
								color="overlaySecondary"
								title={
									isCurrentUser
										? t('sharing.twitter.mint', { daoName, targetNftUrl: '' })
										: t('sharing.twitter.found', { daoName, targetNftUrl: '' })
								}
								fullUrl={fullUrl}
								daoName={daoName}
							/>
						)}
					</>
				)}
			</div>
			{tierName && (
				<>
					{/* Нужно, чтобы не показывать тултип для коротких названий */}
					{tierName?.length > tierNameMaxLength ? (
						<Tooltip placement="bottom" content={upperFirst(tierName)}>
							<Title2 className="mb-2 truncate">{upperFirst(tierName)}</Title2>
						</Tooltip>
					) : (
						<Title2 className="mb-2 truncate" data-testid="NftCard__TierName">
							{upperFirst(tierName)}
						</Title2>
					)}
				</>
			)}
			<div
				className={cn('flex items-center justify-between sm:block', {
					'flex-row-reverse': !!TierArtworkTypeIcon && !!amountNftLabel
				})}
			>
				{TierArtworkTypeIcon && (
					<div className="flex items-center justify-start sm:mb-2" data-testid="NftCard__artworkType">
						<TierArtworkTypeIcon fill={colors.foregroundSecondary} />
						<Caption className="text-foregroundSecondary ml-2 truncate">{tierType.title}</Caption>
					</div>
				)}
				{amountNftLabel && (
					<Caption className="text-foregroundSecondary" data-testid="NftCard__amount">
						{amountNftLabel}
					</Caption>
				)}
			</div>
			<div className={amountNftLabel ? 'mt-6' : 'mt-[50px]'}>
				{creator && creator.name && <UserDetail {...creator} subhead={t('pages.nft.details.creator')} />}
				{owner && owner.name && (
					<UserDetail
						{...owner}
						className={creator && creator.name ? 'mt-6' : ''}
						subhead={t('pages.nft.details.owner')}
					/>
				)}
			</div>
		</div>
	);
};
