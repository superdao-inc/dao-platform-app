import styled from '@emotion/styled';
import upperFirst from 'lodash/upperFirst';
import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { getNftTypeData } from 'src/constants';
import { Caption, Ellipsis, Label2, SubHeading } from 'src/components/text';
import { colors } from 'src/style';
import Tooltip from 'src/components/tooltip';
import { TierArtworkTypeStrings } from 'src/types/types.generated';
import { formatAmountNftString } from 'src/utils/formattes';
import { NftCardTierInfoSkeletonLoader } from 'src/components/nftCard/nftCardTierInfoSkeletonLoader';

type TierDetails = {
	id: string;
	tierName?: string | null;
	maxAmount?: number;
	totalAmount?: number;
};

type NftCardTierInfoProps = {
	tierArtworkType?: TierArtworkTypeStrings;
	tier: TierDetails | string;
	collectionName?: string;
	isLoading?: boolean;
	className?: string;
};

export const NftCardTierInfo = (props: NftCardTierInfoProps) => {
	const { tier, tierArtworkType, collectionName, isLoading, className = '' } = props;
	const { t } = useTranslation();

	const { TierArtworkTypeIcon, ...tierType } = getNftTypeData(tierArtworkType);

	const TierDescriptionElement = useMemo(() => {
		if (typeof tier === 'string') return <Ellipsis>{upperFirst(tier)}</Ellipsis>;

		const quantityDescription = tier.maxAmount ? formatAmountNftString(tier.maxAmount, tier.totalAmount) : null;

		const tierName = tier.tierName || tier.id;

		const tooltipContent = (
			<>
				<SubHeading>
					{t('tooltips.nft.card.tier')}: {upperFirst(tierName)}
				</SubHeading>
				<SubHeading>
					{t('tooltips.nft.card.available')}: {quantityDescription}
				</SubHeading>
			</>
		);

		return (
			<div className="flex gap-1">
				<Ellipsis>{upperFirst(collectionName || tierName)}</Ellipsis>
				{quantityDescription && (
					<>
						{' · '}
						<Tooltip content={tooltipContent} placement="top">
							<p className="whitespace-nowrap">{quantityDescription}</p>
						</Tooltip>
					</>
				)}
			</div>
		);
	}, [collectionName, tier, t]);

	if (isLoading) return <NftCardTierInfoSkeletonLoader />;

	return (
		<div className={`flex items-center justify-between ${className}`}>
			<Caption className="overflow-hidden pr-2" color={colors.foregroundTertiary}>
				{TierDescriptionElement}
			</Caption>
			<div className="hidden lg:block">
				{tierArtworkType && (
					<Tooltip
						content={
							<>
								<Label2>{tierType.title}</Label2>
								<TooltipContent>{tierType.description}</TooltipContent>
							</>
						}
						placement="top"
					>
						{TierArtworkTypeIcon && <TierArtworkTypeIcon fill={colors.foregroundTertiary} />}
					</Tooltip>
				)}
			</div>
		</div>
	);
};

const TooltipContent = styled(SubHeading)`
	max-width: 223px;
	white-space: pre-wrap;
`;
