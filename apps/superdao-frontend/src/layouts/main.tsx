import React, { ReactElement } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import cn from 'classnames';
import { NavigationContainer, Props as NavigationContainerProps } from 'src/features/navigation';
import { shouldRedirectToMobileStub } from 'src/utils/shouldRedirectToMobileStub';
import { useIsAuthorized } from 'src/features/auth/hooks';

type Props = NavigationContainerProps & {
	children?: React.ReactNode;
};

export const MainLayout: React.FC<Props> = (props) => {
	const { children, SecondaryNavigation, useOnlyWhen } = props;
	const { push, asPath, pathname } = useRouter();
	const isAuthorized = useIsAuthorized();

	useEffect(() => {
		if (shouldRedirectToMobileStub(pathname)) {
			push(`/mobile?from=${asPath}`);
		}
	});

	const isSecondaryNavAvailable =
		!useOnlyWhen ||
		(useOnlyWhen === 'not_authorized' && !isAuthorized) ||
		(useOnlyWhen === 'authorized' && isAuthorized);

	return (
		<div
			className={cn('flex min-h-full pb-5', {
				'lg:pl-[352px]': !!isSecondaryNavAvailable && !!SecondaryNavigation,
				'lg:pl-[64px]': !SecondaryNavigation || !isSecondaryNavAvailable
			})}
		>
			<NavigationContainer SecondaryNavigation={isSecondaryNavAvailable ? SecondaryNavigation : undefined} />
			{children}
		</div>
	);
};

export const getMainLayout = (page: ReactElement, props?: Props) => <MainLayout {...props}>{page}</MainLayout>;
