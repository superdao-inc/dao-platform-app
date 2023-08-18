import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { useTranslation } from 'next-i18next';
import concat from 'lodash/concat';

import {
	CustomLink,
	Label2,
	AppsIcon,
	StackIcon,
	DollarFilledIcon,
	HomeFilledIcon,
	HomeIcon,
	AppsFilledIcon,
	StackFilledIcon,
	WalletIcon,
	WalletFilledIcon
} from 'src/components';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';

import { DollarIconSmall } from 'src/components/assets/icons/dollarSmall';
import { getNavigationClass } from 'src/pagesComponents/treasury/styles';

type Props = {
	slug: string;
	isTransactionSeriveEnabled: boolean;
};

const { navigationClass, anchorClass, anchorActiveClass, stickyWrapperClass } = getNavigationClass(false);

export const TreasuryNavigation = ({ slug, isTransactionSeriveEnabled }: Props) => {
	const { pathname: currentPathname } = useRouter();
	const { t } = useTranslation();

	const { data, isLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};

	if (isLoading || !daoData) return null;

	const links = [
		{
			href: `/${slug}/treasury`,
			pathname: '/[slug]/treasury',
			label: t('components.treasury.dashboard'),
			icon: <HomeIcon width={20} height={20} />,
			activeIcon: <HomeFilledIcon width={20} height={20} />
		},
		{
			href: `/${slug}/treasury/assets`,
			pathname: '/[slug]/treasury/assets',
			label: t('components.treasury.assets', { count: 2 }),
			icon: <AppsIcon width={20} height={20} />,
			activeIcon: <AppsFilledIcon width={20} height={20} />
		},
		{
			href: `/${slug}/treasury/nfts`,
			pathname: '/[slug]/treasury/nfts',
			label: t('components.treasury.nfts_title.default'),
			icon: <StackIcon width={20} height={20} />,
			activeIcon: <StackFilledIcon width={20} height={20} />
		},
		{
			href: `/${slug}/treasury/wallets`,
			pathname: '/[slug]/treasury/wallets',
			label: t('components.treasury.wallets', { count: 2 }),
			icon: <WalletIcon width={20} height={20} />,
			activeIcon: <WalletFilledIcon width={20} height={20} />
		}
	];

	const txsLink = {
		href: `/${slug}/treasury/transactions`,
		pathname: '/[slug]/treasury/transactions',
		label: t('components.treasury.transactions'),
		icon: <DollarIconSmall width={20} height={20} />,
		activeIcon: <DollarFilledIcon width={20} height={20} />
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
	icon?: ReactElement;
	activeIcon?: ReactElement;
};

const NavigationItem = ({ href, pathname, label, icon, currentPathname, activeIcon }: NavigationItemProps) => {
	const anchorActivityClass = currentPathname === pathname ? anchorActiveClass : null;
	const isActive = currentPathname === pathname;

	return (
		<li key={href} data-testid={`NavigationItem__${label}`}>
			<CustomLink href={href} pathname={pathname} passHref>
				{() => {
					return (
						<Label2 className={`${anchorClass} ${anchorActivityClass}`}>
							{isActive ? activeIcon : icon}
							<div className="capitalize">{label}</div>
						</Label2>
					);
				}}
			</CustomLink>
		</li>
	);
};
