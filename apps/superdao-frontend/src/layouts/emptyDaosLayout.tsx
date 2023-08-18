import { ReactElement } from 'react';

import { EmptyDaosNavigationContainer } from 'src/features/navigation';

import { getMainLayout } from './main';

export const getEmptyDaosLayout = (page: ReactElement) =>
	getMainLayout(page, {
		SecondaryNavigation: EmptyDaosNavigationContainer
	});
