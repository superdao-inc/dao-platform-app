import { FC } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import defaultTo from 'lodash/defaultTo';
import { useRouter } from 'next/router';
import { useGetUserAchievementTiersQuery } from 'src/gql/achievements.generated';
import { LinkTitle } from 'src/components';
import { AchievementsNfts } from 'src/pagesComponents/achievements/achievementsPage/page';
import { EmptyAchievements } from 'src/pagesComponents/achievements/myProfile/emptyAchievements';
import { getAddress } from '@sd/superdao-shared';

type Props = {
	slug: string;
	currentUserAddress?: string;
	daoAddress: string;
	isMobile: boolean;
	userAddress: string;
	isLeaderBoardTab?: boolean;
};

export const UserProfileAchievements: FC<Props> = (props) => {
	const { daoAddress, currentUserAddress, userAddress, slug, isMobile, isLeaderBoardTab } = props;
	const { t } = useTranslation();
	const router = useRouter();

	const { data: achievementsTiers, isLoading } = useGetUserAchievementTiersQuery(
		{ daoAddress, owner: defaultTo(getAddress(userAddress), '') },
		{
			keepPreviousData: true,
			select: (data) => data.getUserAchievementTiers,
			cacheTime: 0
		}
	);

	if (!isLoading && isEmpty(achievementsTiers)) {
		return <EmptyAchievements link={`/${slug}/achievements/all`} />;
	}

	return (
		<>
			{!isLoading && (
				<>
					<LinkTitle
						link={isLeaderBoardTab ? undefined : `${router.asPath}/achievements`}
						content={t('pages.achievements.all.title')}
						amount={achievementsTiers?.length}
						shouldShowChevron={!isLeaderBoardTab}
					/>
					<AchievementsNfts
						isMobile={isMobile}
						currentUserAddress={currentUserAddress}
						slug={slug}
						nfts={achievementsTiers || []}
					/>
				</>
			)}
		</>
	);
};
