import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

import { PageContent, SubHeading, Title1 } from 'src/components';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { AddMembersManualForm, Props } from 'src/pagesComponents/dao/addMembersManualForm';
import { useDaoByIdQuery } from 'src/gql/daos.generated';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { UserAPI } from 'src/features/user/API';
import { isBrowser } from 'src/utils/browser';
import { CustomHead } from 'src/components/head';
import { colors } from 'src/style';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';
import { MobileHeader } from 'src/components/mobileHeader';
import { airdropGuideLink, contactSupportCustomiseLink } from 'src/constants';

const AddMember: NextPageWithLayout<Props> = (props) => {
	const { daoId } = props;

	const { t } = useTranslation();

	const { data: daoData } = useDaoByIdQuery({ id: daoId });
	const { daoById: dao } = daoData || {};
	const { data: roleData, isLoading } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });
	const { currentUserMemberRole } = roleData || {};

	const { back, push, query } = useRouter();

	const isWhitelistMode = useMemo(() => Boolean(query.addToWhitelist), [query]);

	const BreadcrumbsPaths = useMemo(
		() => (isWhitelistMode ? t('pages.dao.members.actions.whitelistAdd') : t('pages.dao.members.actions.airdropAdd')),
		[isWhitelistMode, t]
	);

	if (!dao) return null;

	if ((!isLoading && !currentUserMemberRole) || (!isAdmin(currentUserMemberRole) && isBrowser)) {
		push(`/${dao.slug}`);
		return null;
	}

	return (
		<PageContent onBack={back} columnSize="sm">
			<CustomHead main={dao.name} additional={'Members addition'} description={dao.description} avatar={dao.avatar} />

			<div className="mx-auto w-[min(560px,100$)]">
				<MobileHeader onBack={back} title={BreadcrumbsPaths} />

				<Title1 className="hidden lg:flex">{BreadcrumbsPaths}</Title1>
				<StyledSubHeading className="mt-3 mb-6">
					<Trans
						i18nKey={`pages.importMembers.${isWhitelistMode ? 'whitelistSubHeading' : 'subHeading'}`}
						components={[
							<a href={airdropGuideLink} target="_blank" key="0" rel="noreferrer" />,
							<a href={contactSupportCustomiseLink} target="_blank" key="1" rel="noreferrer" />
						]}
					/>
				</StyledSubHeading>

				<AddMembersManualForm
					daoId={daoId}
					daoSlug={dao.slug}
					daoAddress={dao.contractAddress || ''}
					isWhitelistMode={isWhitelistMode}
				/>
			</div>
		</PageContent>
	);
};

AddMember.getLayout = getDaoLayout;

export default AddMember;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userId = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	if (isAuthorized) {
		await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });
	}

	return {
		props: {
			daoId: dao.id,
			...getProps()
		}
	};
});

const StyledSubHeading = styled(SubHeading)`
	& a {
		color: ${colors.accentPrimary};
	}
`;
