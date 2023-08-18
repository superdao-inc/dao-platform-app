import { ReactElement } from 'react';

import { ProfileNavigationContainer } from 'src/features/navigation';

import { getMainLayout } from './main';

export const getProfileLayout = (page: ReactElement) =>
	getMainLayout(page, {
		SecondaryNavigation: ProfileNavigationContainer
	});
