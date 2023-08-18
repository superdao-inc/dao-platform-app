import { useRouter } from 'next/router';

import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { useTranslation } from 'next-i18next';
import { colors } from 'src/style';

import { Header, Name } from 'src/pagesComponents/common/header';
import { Menu } from 'src/pagesComponents/dao/menu';
import { Body, CustomLink, LockIcon } from 'src/components';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { UserAPI } from 'src/features/user/API';
import { AuthAPI } from 'src/features/auth/API';
import { isAdmin } from 'src/utils/roles';

type Props = {
	slug: string;
	daoId: string;
};

export const DaoNavigation = (props: Props) => {
	const { slug, daoId } = props;

	const { pathname: currentPathname } = useRouter();
	const { t } = useTranslation();

	const isAuthorized = AuthAPI.useIsAuthorized();
	const { data, isLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};

	const { data: currentUserAsMember } = UserAPI.useCurrentUserMemberRoleQuery({ daoId }, { enabled: isAuthorized });
	const { currentUserMemberRole } = currentUserAsMember || {};

	if (isLoading || !daoData) return null;

	const isMemberUser = !!currentUserMemberRole;
	const isUserAdmin = isMemberUser && isAdmin(currentUserMemberRole);

	const links = [
		{
			href: `/${slug}`,
			pathname: '/[slug]',
			label: t('components.dao.navigation.links.about'),
			isPublic: true,
			position: 0
		},
		{
			href: `/${slug}/members`,
			pathname: '/[slug]/members',
			label: t('components.dao.navigation.links.members'),
			isPublic: true,
			position: 5
		},
		{
			href: `/${slug}/treasury`,
			pathname: '/[slug]/treasury',
			label: t('components.dao.settings.treasury'),
			isPublic: true,
			position: 10
		},
		{
			href: `/${slug}/feed`,
			pathname: '/[slug]/feed',
			label: t('components.dao.navigation.links.feed'),
			isPublic: false,
			position: 15
		}
	];

	if (daoData.isVotingEnabled) {
		links.push({
			href: `/${slug}/voting`,
			pathname: '/[slug]/voting',
			label: t('components.dao.navigation.links.voting'),
			isPublic: false,
			position: 20
		});
	}

	const sortedLinks = links.sort((a, b) => a.position - b.position);

	return (
		<Header>
			<Name>
				<span className="truncate">{daoData.name}</span>
			</Name>

			<Navigation>
				{sortedLinks.map((item) => (
					<NavigationItem key={item?.label} currentPathname={currentPathname} isMemberUser={isMemberUser} {...item} />
				))}
			</Navigation>

			{isUserAdmin && <Menu slug={slug} />}
		</Header>
	);
};

type NavigationItemProps = {
	href: string;
	pathname: string;
	label: string;
	isPublic: boolean;
	isMemberUser: boolean;
	currentPathname: string;
};

const NavigationItem = ({ href, pathname, label, isPublic, currentPathname, isMemberUser }: NavigationItemProps) => {
	const anchorActivityClass = currentPathname === pathname ? anchorActiveStyles : null;

	return (
		<LinkWrapper key={href} data-testid={`DaoNavigation__${label.toLowerCase()}`}>
			<CustomLink href={href} pathname={pathname} passHref>
				{(highlighted) => {
					return (
						<Body css={[anchorStyles, anchorActivityClass]}>
							{!isMemberUser && !isPublic && <LockIcon className="mr-1 h-4 w-4" />}

							<IsNewLink highlighted={highlighted}>{label}</IsNewLink>
						</Body>
					);
				}}
			</CustomLink>
		</LinkWrapper>
	);
};

const Navigation = styled.ul`
	margin-left: auto;
	margin-top: 0;
	margin-bottom: 0;
	padding: 0 12px;

	display: flex;
	list-style-type: none;
	gap: 24px;
`;

const LinkWrapper = styled.li`
	cursor: pointer;
`;

const anchorStyles = css`
	display: flex;
	align-items: center;

	font-weight: 600;
	color: ${colors.foregroundSecondary};
	transition: all 0.3s;

	svg {
		transition: fill 0.3s;
		fill: ${colors.foregroundSecondary};
	}

	&:hover {
		color: ${colors.accentPrimaryHover};

		svg {
			fill: ${colors.accentPrimaryHover};
		}
	}
`;
const anchorActiveStyles = css`
	color: ${colors.accentPrimaryActive};

	svg {
		fill: ${colors.accentPrimaryActive};
	}
`;

const IsNewLink = styled.div<{ highlighted: boolean }>`
	position: relative;
	&::before {
		${({ highlighted }) =>
			highlighted &&
			`
				content: '';
				position: absolute;
				top: 2px;
				right: -6px;
				width: 4px;
				height: 4px;
				background: ${colors.tintCyan};
				border-radius: 50%;
			`}
	}
`;
