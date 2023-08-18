import { useState } from 'react';
import { Button, ChevronDown } from 'src/components';

type ShutterProps = {
	children: any;
	initState?: boolean;
	btnLabel: string;
};

export const Shutter = ({ children, initState = false, btnLabel }: ShutterProps) => {
	const [isOpen, setIsOpen] = useState(initState);

	return (
		<>
			<Button
				leftIcon={isOpen ? <ChevronDown className="rotate-180" /> : <ChevronDown />}
				size="lg"
				color="overlaySecondary"
				label={btnLabel}
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				data-testid=""
			/>
			{isOpen && <div>{children}</div>}
		</>
	);
};
