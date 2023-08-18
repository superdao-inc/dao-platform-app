import { ReactElement } from 'react';

import { UserNavigationContainer } from 'src/features/navigation';

import { getMainLayout } from './main';

export const getUserLayout = (page: ReactElement) =>
	getMainLayout(page, {
		SecondaryNavigation: UserNavigationContainer,
		useOnlyWhen: 'not_authorized'
	});
