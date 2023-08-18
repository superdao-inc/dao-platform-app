import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ReactElement, useMemo } from 'react';

import { CustomLink, InfoOutline, Label2, OutlineVotingIcon } from 'src/components';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { colors } from 'src/style';

type Props = {
	slug: string;
};

export const SettingsNavigation = ({ slug }: Props) => {
	const { pathname: currentPathname } = useRouter();
	const { t } = useTranslation();

	const { data, isLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { isVotingEnabled = false } = data?.daoBySlug ?? {};

	const navigationLinks = useMemo(() => {
		const links = [
			{
				href: `/${slug}/settings/about/edit`,
				pathname: '/[slug]/settings/about/edit',
				label: t('components.dao.settings.about'),
				icon: <InfoOutline width={14} height={14} />
			}
		];

		if (isVotingEnabled) {
			links.push({
				href: `/${slug}/settings/voting/edit`,
				pathname: '/[slug]/settings/voting/edit',
				label: t('components.dao.settings.voting.title'),
				icon: <OutlineVotingIcon width={14} height={14} />
			});
		}

		return links;
	}, [t, isVotingEnabled, slug]);

	if (isLoading || !data || navigationLinks.length < 2) return null;

	return (
		<StickyWrapper>
			<Navigation>
				{navigationLinks.map((item) => (
					<NavigationItem key={item?.label} currentPathname={currentPathname} {...item} />
				))}
			</Navigation>
		</StickyWrapper>
	);
};

type NavigationItemProps = {
	href: string;
	pathname: string;
	label: string;
	currentPathname: string;
	icon?: ReactElement;
};

const NavigationItem = ({ href, pathname, label, icon, currentPathname }: NavigationItemProps) => {
	const anchorActivityClass = currentPathname === pathname ? anchorActiveStyles : null;
	return (
		<li key={href}>
			<CustomLink href={href} pathname={pathname} passHref>
				{() => {
					return (
						<Label2 css={[anchorStyles, anchorActivityClass]}>
							{icon}
							<div className="capitalize">{label}</div>
						</Label2>
					);
				}}
			</CustomLink>
		</li>
	);
};

const Navigation = styled.ul`
	margin-left: auto;
	margin-top: 0;

	display: flex;
	list-style-type: none;
	gap: 16px;
	background: ${colors.backgroundPrimary};
	padding: 16px 0;
`;

const anchorStyles = css`
	display: flex;
	align-items: center;

	cursor: pointer;
	padding: 10px 16px;
	background: ${colors.backgroundSecondary};
	border-radius: 8px;

	font-weight: 600;
	color: ${colors.foregroundSecondary};
	transition: all 0.3s;
	gap: 8px;
	svg {
		transition: fill 0.3s;
		fill: ${colors.foregroundTertiary};
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

const StickyWrapper = styled.div`
	position: sticky;
	top: 0;
	left: 0;
	overflow-y: auto;
	margin-top: -16px;
	z-index: 1;
`;
