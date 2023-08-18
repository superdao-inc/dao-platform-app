import { FC } from 'react';
import SudoHeader from 'src/features/sudo/components/sudoHeader';

type Props = {
	children?: React.ReactNode;
};

export const SudoLayout: FC<Props> = ({ children }) => (
	<div>
		<SudoHeader />
		<div className="mt-10 flex flex-wrap justify-center p-10">{children}</div>
	</div>
);
