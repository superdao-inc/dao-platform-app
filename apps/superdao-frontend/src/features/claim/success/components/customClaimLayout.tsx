import { FC } from 'react';

import { PageContent } from 'src/components';
import { CustomHead } from 'src/components/head';

type LayoutProps = {
	name?: string | null;
	description?: string | null;
	onBack?: () => void;
	children?: React.ReactNode;
};

export const CustomClaimLayout: FC<LayoutProps> = ({ name, description, onBack, children }) => (
	<PageContent onBack={onBack} className="h-[calc(100vh-20px)]" arrowClassName="z-1">
		<CustomHead
			main={name ? name : 'Claim success'}
			additional={name ? 'Claim success' : 'Superdao'}
			description={description ?? ''}
		/>
		{children}
	</PageContent>
);
