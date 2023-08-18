type Props = {
	type: 'active' | 'inactive' | 'progress';
};

export const Line = ({ type }: Props) => {
	let colorClasses;
	switch (type) {
		case 'active': {
			colorClasses = 'bg-accentPrimary';
			break;
		}
		case 'progress': {
			colorClasses = 'bg-gradient-to-b from-accentPrimary to-backgroundTertiary';
			break;
		}
		case 'inactive':
		default: {
			colorClasses = 'bg-backgroundTertiary';
			break;
		}
	}

	return <div className={`h-full w-1 rounded ${colorClasses}`} />;
};
