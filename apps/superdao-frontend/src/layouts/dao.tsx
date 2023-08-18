import { ReactElement } from 'react';
import { DaoNavigationContainer } from 'src/features/navigation';

import { getMainLayout } from './main';

export const getDaoLayout = (page: ReactElement) =>
	getMainLayout(page, {
		SecondaryNavigation: DaoNavigationContainer
	});
