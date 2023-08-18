import { ReactElement } from 'react';

import { getMainLayout } from './main';

export const getDefaultLayout = (page: ReactElement) => getMainLayout(page);
