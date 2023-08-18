import { isMobile } from 'is-mobile';

const pagesWithMobileStub = [
	'/[slug]/custom',
	'/[slug]/treasury/wallets/[id]',
	'/[slug]/treasury/wallets/[id]/edit',
	'/[slug]/treasury/wallets/create',
	'/[slug]/voting/[proposal]/edit',
	'/[slug]/voting/create',
	'/[slug]/voting/integration',
	'/beta/request',
	'/daos/create',
	'/discovery',
	'/feed',
	'/sudo',
	'/sudo/daos',
	'/sudo/daos/[slug]',
	'/sudo/daos/whitelist',
	'/sudo/onboarding',
	'/sudo/scripts',
	'/sudo/treasury',
	'/uikit',
	'/uikit/form',
	'/uikit/icons',
	'join-beta'
];

export const shouldRedirectToMobileStub = (pathname: string) => {
	const pageHasMobileStub = pagesWithMobileStub.includes(pathname);

	return isMobile() && pageHasMobileStub;
};
