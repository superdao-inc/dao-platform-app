import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import concat from 'lodash/concat';
import { useEffect, useRef } from 'react';

import { CustomLink, Label2 } from 'src/components';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';

import { getNavigationClass } from 'src/pagesComponents/treasury/styles';

type Props = {
	slug: string;
	isTransactionSeriveEnabled: boolean;
};

const { navigationClass, anchorClass, anchorActiveClass, stickyWrapperClass } = getNavigationClass(true);

export const MobileNavigation = ({ slug, isTransactionSeriveEnabled }: Props) => {
	const { pathname: currentPathname } = useRouter();
	const { t } = useTranslation();

	const { data, isLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};

	if (isLoading || !daoData) return null;

	const links = [
		{
			href: `/${slug}/treasury`,
			pathname: '/[slug]/treasury',
			label: t('components.treasury.dashboard')
		},
		{
			href: `/${slug}/treasury/assets`,
			pathname: '/[slug]/treasury/assets',
			label: t('components.treasury.assets', { count: 2 })
		},
		{
			href: `/${slug}/treasury/nfts`,
			pathname: '/[slug]/treasury/nfts',
			label: t('components.treasury.nfts_title.default')
		},
		{
			href: `/${slug}/treasury/wallets`,
			pathname: '/[slug]/treasury/wallets',
			label: t('components.treasury.wallets', { count: 2 })
		}
	];

	const txsLink = {
		href: `/${slug}/treasury/transactions`,
		pathname: '/[slug]/treasury/transactions',
		label: t('components.treasury.transactions')
	};

	const navigationLinks = isTransactionSeriveEnabled ? concat(links, txsLink) : links;

	return (
		<div className={stickyWrapperClass}>
			<ul className={navigationClass}>
				{navigationLinks.map((item) => (
					<NavigationItem key={item?.label} currentPathname={currentPathname} {...item} />
				))}
			</ul>
		</div>
	);
};

type NavigationItemProps = {
	href: string;
	pathname: string;
	label: string;
	currentPathname: string;
};

const NavigationItem = ({ href, pathname, label, currentPathname }: NavigationItemProps) => {
	const activeRef = useRef<HTMLLIElement>(null);
	const isActive = currentPathname === pathname;

	useEffect(() => {
		isActive && activeRef?.current?.scrollIntoView(false);
	}, [isActive]);

	const anchorActivityClass = isActive ? anchorActiveClass : null;

	return (
		<li key={href} ref={activeRef} data-testid={`NavigationItem__${label}`}>
			<CustomLink href={href} pathname={pathname} passHref>
				{() => {
					return (
						<Label2 className={`${anchorClass} ${anchorActivityClass}`}>
							<div className="capitalize">{label}</div>
						</Label2>
					);
				}}
			</CustomLink>
		</li>
	);
};
