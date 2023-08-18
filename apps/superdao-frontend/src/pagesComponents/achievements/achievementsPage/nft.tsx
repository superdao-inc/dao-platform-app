import { FC } from 'react';
import cn from 'classnames';
import concat from 'lodash/concat';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { AchievementTierFragment } from 'src/gql/achievements.generated';
import { colors } from 'src/style';
import { ArtworkView, ArtworkViewProps } from 'src/components/artwork/artworkView';
import { Caption, Detail, SubHeading, Title3 } from 'src/components/text';
import Tooltip from 'src/components/tooltip';
import { MetadataAttributesSdTraits } from 'src/pagesComponents/dao/nftEdit/types';
import { isNotEmpty } from '@sd/superdao-shared';

type NftProps = Partial<AchievementTierFragment> & {
	artworkProps: ArtworkViewProps;
	membersCount: number;
	isAchieved: boolean;
	slug?: string;
	nftCount?: number;
	isMobile: boolean;
};

export const getNftClass = () => {
	const Wrapper =
		'bg-backgroundSecondary relative cursor-pointer sm:p-4 sm:mb-5 w-full max-w-[156px] rounded-md md:mb-0 md:mr-4 sm:max-w-[240px] sm:min-h-[370px] min-h-[320px]';

	const ArtworkView =
		'h-full max-h-[156px] max-w-[156px] sm:max-h-[208px] sm:max-w-[240px] w-full rounded-md [&_img]:rounded-lg';

	return {
		wrapperClass: cn(Wrapper),
		artworkViewClass: cn(ArtworkView)
	};
};

const Badge = ({ title, isColored = false }: { title: string; isColored?: boolean }) => {
	return (
		<Detail
			className={cn(
				'flex max-h-[20px] w-auto flex-row items-center justify-center rounded-[50px] py-1 px-2',
				isColored ? 'bg-tintPurple' : 'bg-backgroundTertiary text-foregroundTertiary'
			)}
		>
			{title.toUpperCase()}
		</Detail>
	);
};

export const Nft: FC<NftProps> = (props) => {
	const {
		artworkProps,
		isAchieved,
		membersCount,
		slug,
		id,
		nftCount,
		metadata,
		tierName,
		isMobile,
		description: tierDescription
	} = props;
	const { push } = useRouter();
	const { t } = useTranslation();

	const { wrapperClass, artworkViewClass } = getNftClass();

	const xp = metadata?.attributes
		?.filter((attr) => attr.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_XP_SD_TRAIT)
		.map((attr) => attr.value)[0];
	const xpBadge = xp ? [{ title: `${xp} xp`, isColored: true }] : [];
	const membersBadge =
		membersCount !== 0 ? [{ title: t('components.achievements.card.members', { count: membersCount }) }] : [];

	const labels =
		(metadata?.attributes
			?.filter((attr) => attr.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_LABEL_SD_TRAIT)
			.map((attr) => attr.value)
			.filter((attr) => isNotEmpty(attr)) as string[]) || [];
	const defaultBadges = concat(xpBadge, membersBadge);

	const badges: {
		title: string;
		isColored?: boolean;
	}[] = isEmpty(labels) ? defaultBadges : concat(defaultBadges, labels?.map((label) => ({ title: label })) || []);

	const goToAchievementDetails = () => push(`/${slug}/achievements/all/${id}`);

	return (
		<>
			<div onClick={goToAchievementDetails} className={cn(wrapperClass)}>
				<ArtworkView {...artworkProps} className={`${artworkViewClass}`} />
				<div
					className={cn(
						'justify-centre ml-2 flex flex-col sm:ml-0',
						artworkProps.artworks.length === 1 ? 'h-[130px]' : 'h-[117px]'
					)}
				>
					<div>
						<div className={cn(artworkProps.artworks.length === 1 && 'mt-3', 'flex items-center gap-1')}>
							{isMobile ? (
								<Caption className="mt-3 inline-block" color={colors.foregroundPrimary}>
									{tierName}
								</Caption>
							) : (
								<Title3 className="inline-block" color={colors.foregroundPrimary}>
									{tierName}
								</Title3>
							)}
							{nftCount &&
								nftCount > 1 &&
								(isMobile ? (
									<Caption className="mt-3 inline-block" color={colors.foregroundTertiary}>{`· ${nftCount}`}</Caption>
								) : (
									<Tooltip
										className="inline-block cursor-pointer"
										content={t('components.achievements.card.achievementsNumberTooltip', {
											count: nftCount,
											tierName
										})}
										placement="top"
									>
										<Caption color={colors.foregroundTertiary}>{`· ${nftCount}`}</Caption>
									</Tooltip>
								))}
						</div>
						<div className={`items-top flex max-h-[50px] gap-2 pb-2`}>
							{isMobile ? (
								<Caption className="line-clamp-2 overflow-hidden text-ellipsis" color={colors.foregroundTertiary}>
									{tierDescription}
								</Caption>
							) : (
								<SubHeading className="line-clamp-2 overflow-hidden text-ellipsis" color={colors.foregroundTertiary}>
									{tierDescription}
								</SubHeading>
							)}
						</div>
					</div>
					<div className=" overflow-auto">
						<div className="mr-3 flex flex-auto flex-wrap gap-1.5">
							{badges.map((item, ind) => (
								<Badge key={ind} title={item.title} isColored={item.isColored} />
							))}
						</div>
					</div>

					{isAchieved && (
						<Tooltip
							content={t('components.achievements.card.achievedTooltip')}
							placement="top"
							className="absolute right-0 bottom-0 h-5 w-8"
						>
							<div
								style={{
									background: 'linear-gradient(135deg, transparent 1.5em, #FFC619 0, #FF7919 100%)'
								}}
								className='absolute bottom-0 right-0 ml-auto flex h-[34px] w-[34px] items-center justify-end rounded-br-lg pt-2 pr-1 after:content-["✓"]'
							></div>
						</Tooltip>
					)}
				</div>
			</div>
		</>
	);
};
