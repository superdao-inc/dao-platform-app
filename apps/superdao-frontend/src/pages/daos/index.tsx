import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { CreateDaoItem, EditProfileItem, PageContent, PageLoader, Title1 } from 'src/components';
import { borders, colors } from 'src/style';
import { UserAPI } from 'src/features/user/API';
import { CustomHead } from 'src/components/head';
import { getEmptyDaosLayout } from 'src/layouts';
import { NextPageWithLayout } from 'src/layouts';
import { MobileHeader } from 'src/components/mobileHeader';

const DaosPage: NextPageWithLayout = () => {
	const { t } = useTranslation();
	const { replace, query } = useRouter();

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};
	const { data: daos } = UserAPI.useUserDaoParticipationQuery({ userId: userData!.id });
	const { daoParticipation } = daos || {};

	const hasBetaAccess = userData?.hasBetaAccess;
	const firstDaoSlug = daoParticipation?.items[0]?.dao.slug;

	useEffect(() => {
		if (firstDaoSlug) {
			replace({ pathname: `/${firstDaoSlug}`, query });
		}
	});

	if (!userData) return null;

	if (firstDaoSlug) {
		return (
			<PageContent className="items-center">
				<CustomHead main={'DAOs'} additional={'Superdao'} description={'DAOs'} />

				<PageLoader />
			</PageContent>
		);
	}

	return (
		<PageContent>
			<div className="flex h-full flex-col">
				<CustomHead main={'DAOs'} additional={'Superdao'} description={'DAOs'} />

				<MobileHeader withBurger />

				<div className="flex flex-1 flex-col items-center justify-center">
					<GettingStarted>
						<Title1 className="mb-2" css={headerStyles}>
							{t('components.onboarding.title')}
						</Title1>

						<EditProfileItem />
						<CreateDaoItem hasBetaAccess={!!hasBetaAccess} />
					</GettingStarted>
				</div>
			</div>
		</PageContent>
	);
};

DaosPage.getLayout = getEmptyDaosLayout;

export default DaosPage;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

const GettingStarted = styled.div`
	border-radius: ${borders.medium};
	background-color: ${colors.backgroundSecondary};

	width: min(560px, 100%);

	padding: 16px 12px;

	display: flex;
	flex-direction: column;
`;

const headerStyles = css`
	margin-left: 12px;
`;
