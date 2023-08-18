import React from 'react';

import { Title1 } from 'src/components/text';
import { ChevronIcon } from 'src/components/assets/icons';

type Props = {
	paths: string[];
	className?: string;
};

export const Breadcrumbs = (props: Props) => {
	const { paths, className } = props;

	return (
		<header className={`flex items-center gap-2 overflow-hidden ${className}`}>
			{paths.map((path, i) => (
				<React.Fragment key={path}>
					<Title1 className="block truncate">{path}</Title1>
					{i < paths.length - 1 && <ChevronIcon />}
				</React.Fragment>
			))}
		</header>
	);
};
