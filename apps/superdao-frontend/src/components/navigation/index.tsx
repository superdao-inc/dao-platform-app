import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';
import { NavigationItem } from 'src/components/navigation/navigationItem';
import { colors } from 'src/style';
import Tooltip from 'src/components/tooltip';
import { ProfileNav } from 'src/components/navigation/profileWrapper';
import { TooltipContent } from 'src/components/navigation/tooltipContent';
import { HintIcon } from 'src/components/assets/icons/hint';

export const Navigation = () => {
	const { pathname } = useRouter();
	const { t } = useTranslation();

	return (
		<Wrapper>
			<Link href="/daos">
				<a data-testid="NavigationItem__logo">
					<Logo width="36px" height="36px" src="/logo.svg" />
				</a>
			</Link>

			<Tooltip content={<TooltipContent title={t('tooltips.navigation.daos.title')} />} placement="right">
				<NavigationItem pathname={pathname} href="/daos" />
			</Tooltip>

			<Tooltip
				content={
					<TooltipContent
						title={t('tooltips.navigation.feed.title')}
						description={t('tooltips.navigation.feed.description')}
					/>
				}
				placement="right"
			>
				<NavigationItem isDisabled pathname={pathname} href="/feed" />
			</Tooltip>

			<Tooltip
				content={
					<TooltipContent
						title={t('tooltips.navigation.discover.title')}
						description={t('tooltips.navigation.discover.description')}
					/>
				}
				placement="right"
			>
				<NavigationItem isDisabled pathname={pathname} href="/discovery" />
			</Tooltip>

			<Tooltip
				className="mt-auto"
				content={<TooltipContent title={t('tooltips.navigation.knowledge.title')} />}
				placement="right"
			>
				<a
					className="hover:bg-overlaySecondary flex cursor-pointer items-center justify-center px-5 py-4 transition-all duration-300"
					href="https://help.superdao.co/"
					target="_blank"
					rel="noreferrer"
				>
					<HintIcon className="h-6 w-6" />
				</a>
			</Tooltip>

			<ProfileNav />
		</Wrapper>
	);
};

const Wrapper = styled.nav`
	position: sticky;
	top: 0;
	bottom: 0;
	left: 0;

	display: flex;
	flex-direction: column;

	height: 100vh;

	background: ${colors.backgroundTertiary};
`;

const Logo = styled.img`
	margin: 16px 14px 20px;
	width: 36px;
	height: 36px;
`;
