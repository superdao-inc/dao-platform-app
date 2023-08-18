import { Button } from 'src/components';

type ActionButtonProps = {
	label: string;
	disabled?: boolean;
	onClick(): void;
	isLoading?: boolean;
};
export const ActionButton = (props: ActionButtonProps) => {
	const { label, disabled, onClick, isLoading = false } = props;

	return (
		<Button
			className="w-max"
			color="accentPrimary"
			size="lg"
			label={label}
			onClick={onClick}
			disabled={disabled}
			isLoading={isLoading}
		/>
	);
};
