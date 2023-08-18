import React, { FC } from 'react';

import { PageContent } from 'src/components';
import { CustomHead } from 'src/components/head';

type LayoutProps = {
	name?: string | null;
	description?: string | null;
	children?: React.ReactNode;
};

export const CustomSuccessLayout: FC<LayoutProps> = ({ name, description, children }) => (
	<PageContent>
		<CustomHead
			main={name ? name : 'Checkout success'}
			additional={name ? 'Checkout success' : 'Superdao'}
			description={description ?? ''}
		/>

		{children}
	</PageContent>
);
