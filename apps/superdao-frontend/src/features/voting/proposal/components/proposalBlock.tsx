import { FC, HTMLAttributes } from 'react';

interface ProposalBlockAttributes extends HTMLAttributes<HTMLDivElement> {
	dataTestId?: string;
}

export const ProposalBlock: FC<ProposalBlockAttributes> = ({ children, className, dataTestId }) => {
	return (
		<div className={`bg-backgroundSecondary w-full rounded-lg py-4 px-5 ${className}`} data-testid={dataTestId}>
			{children}
		</div>
	);
};
