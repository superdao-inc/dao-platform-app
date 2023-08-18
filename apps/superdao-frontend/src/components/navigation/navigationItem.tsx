import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

import { SvgProps } from '../assets/svg';
import { colors } from 'src/style';
import {
	DaosFilledIcon,
	DaosIcon,
	DiscoveryFilledIcon,
	DiscoveryIcon,
	HomeFilledIcon,
	HomeIcon
} from 'src/components/assets/icons';

type AllowedHref = '/feed' | '/daos' | '/discovery';

type Props = {
	href: AllowedHref;
	pathname: string;
	isDisabled?: boolean;
};

type IconElement = React.ElementType<SvgProps>;

const iconsByHref: Record<AllowedHref, { active: IconElement; inactive: IconElement }> = {
	'/feed': { active: HomeFilledIcon, inactive: HomeIcon },
	'/daos': { active: DaosFilledIcon, inactive: DaosIcon },
	'/discovery': { active: DiscoveryFilledIcon, inactive: DiscoveryIcon }
};

export const NavigationItem = (props: Props) => {
	const { pathname, href, isDisabled } = props;

	const isActive = pathname.startsWith(href);
	const IconComponent = isActive ? iconsByHref[href].active : iconsByHref[href].inactive;

	const renderItem = () => (
		<NavigationItemWrapper
			isActive={isActive}
			isDisabled={!!isDisabled}
			data-testid={`NavigationItem__${href.replace(/\//g, '')}`}
		>
			<IconComponent fill={isActive ? colors.accentPrimary : colors.foregroundSecondary} />
		</NavigationItemWrapper>
	);

	return isDisabled ? (
		renderItem()
	) : (
		<Link href={href} passHref>
			{renderItem()}
		</Link>
	);
};

const NavigationItemWrapper = styled.a<{ isActive: boolean; isDisabled: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px 20px;
	position: relative;
	cursor: pointer;
	transition: background-color 300ms;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}

	&::before {
		display: ${(props) => (props.isActive ? 'block' : 'none')};
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;

		width: 2px;

		border-radius: 0 2px 2px 0;
		background-color: ${colors.accentPrimary};
	}

	svg {
		fill: ${(props) => props.isDisabled && !props.isActive && colors.foregroundTertiary};
	}
`;
