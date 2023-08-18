import { FC } from 'react';

import { Body } from 'src/components/text';

type Option = {
	text: string;
	iconURI: string;
	isActive: boolean;
	onClick: () => void;
};

type Props = {
	options: Option[];
};

export const SubNavigationBar: FC<Props> = ({ options }) => {
	return (
		<div className="bg-overlaySecondary my-3 flex w-full gap-1 rounded p-1 lg:my-5">
			{options.map((option, index) => (
				<div
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					className={`text-foregroundPrimary flex flex-1 cursor-pointer items-center justify-center gap-2 rounded py-1 pl-2 pr-2 transition-all ${
						option.isActive ? 'bg-backgroundQuaternary' : 'hover:bg-backgroundTertiary active:bg-backgroundQuaternary'
					}`}
					onClick={option.onClick}
				>
					<img className={`h-5 w-5 ${option.isActive ? '' : 'opacity-40'}`} src={option.iconURI} alt={option.text} />
					<Body className={`${option.isActive ? '' : 'opacity-40'}`}>{option.text}</Body>
				</div>
			))}
		</div>
	);
};
