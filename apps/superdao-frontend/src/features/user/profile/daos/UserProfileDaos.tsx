import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { memo } from 'react';
import Link from 'next/link';
import { Body, CreateDaoItem, DaosList, EmptyDaos, Label1, LinkTitle } from 'src/components';
import { colors } from 'src/style';
import { UserAPI } from 'src/features/user/API';
import { getDaoMemberDaosPath } from 'src/features/user/constants';
import { PublicUserFragment, UserDaoParticipationQuery } from 'src/gql/user.generated';

type UserProfileDaosContainerProps = {
	user: Pick<PublicUserFragment, 'id' | 'walletAddress' | 'displayName' | 'hasBetaAccess'>;
	userDaos: UserDaoParticipationQuery['daoParticipation']['items'];

	isDaoTab?: boolean;
	daosLinkPath?: string;

	className?: string;
};

const VISIBLE_DAOS_COUNT = 4;

const UserProfileDaos = (props: UserProfileDaosContainerProps) => {
	const { user, userDaos, isDaoTab, daosLinkPath, className = '' } = props;
	const { id: userId } = user;

	const { t } = useTranslation();

	const { query } = useRouter();
	const { slug: daoSlug } = query;

	const isCurrentUserProfile = UserAPI.useIsCurrentUser(userId);

	const { walletAddress, displayName, hasBetaAccess } = user;

	const generatedDaosLinkPath = isDaoTab ? getDaoMemberDaosPath(daoSlug as string, userId) : daosLinkPath ?? '';

	const collapsedDaosCount = userDaos.length - VISIBLE_DAOS_COUNT;

	const getContent = () => {
		if (userDaos.length > 0) return <DaosList isShort daos={userDaos} />;

		if (isCurrentUserProfile)
			return (
				<div className="bg-backgroundSecondary rounded-xl py-5 px-6">
					<Body color={colors.foregroundSecondary}>{t('pages.userDaos.errors.currentUserNotFound')}</Body>

					<div className="-mx-3 mt-4">
						<CreateDaoItem hasBetaAccess={hasBetaAccess} />
						{/* <ExploreDaosItem /> */}
					</div>
				</div>
			);

		return <EmptyDaos displayName={displayName} walletAddress={walletAddress} />;
	};

	return (
		<div data-testid="Profile__daosBlock" className={className}>
			<LinkTitle
				link={generatedDaosLinkPath}
				content={t('pages.userDaos.title')}
				amount={userDaos.length}
				shouldShowChevron={userDaos.length > 3}
			/>

			{getContent()}

			{collapsedDaosCount > 0 && (
				<Link href={generatedDaosLinkPath} passHref>
					<a>
						<div className="hover:bg-overlayTertiary bg-overlaySecondary mt-3 flex cursor-pointer items-center justify-center rounded-xl p-[10px] transition-all lg:hidden">
							<Label1>+{collapsedDaosCount}</Label1>
						</div>
					</a>
				</Link>
			)}
		</div>
	);
};

export default memo(UserProfileDaos);
