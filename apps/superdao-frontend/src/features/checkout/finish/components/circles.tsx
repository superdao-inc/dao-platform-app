import React, { FC } from 'react';
import { CheckIcon, Loader } from 'src/components';
import { colors } from 'src/style';

export const PrevStepCircle = () => (
	<Circle color="bg-accentPrimary">
		<div className="absolute top-1 left-1">
			<CheckIcon fill={colors.foregroundPrimary} />
		</div>
	</Circle>
);

export const CurrentStepCircle = () => (
	<Circle color="bg-accentPrimary">
		<div className="bg-foregroundPrimary absolute top-2 left-2 h-2 w-2 rounded-full" />
	</Circle>
);

export const CurrentStepLoadingCircle = () => (
	<Circle color="bg-accentPrimary" hasShadow>
		<div className="absolute top-1 left-1 h-2 w-2">
			<Loader color="light" />
		</div>
	</Circle>
);

export const NextStepCircle = () => (
	<Circle color="bg-backgroundTertiary">
		<div className="bg-foregroundTertiary absolute top-2 left-2 h-2 w-2 rounded-full" />
	</Circle>
);

type Props = {
	color: string;
	hasShadow?: boolean;
	children?: React.ReactNode;
};

const Circle: FC<Props> = ({ children, color, hasShadow = false }) => {
	return (
		<div className={`relative inline-block h-6 w-6 rounded-full ${hasShadow ? 'shadow-orangeCircle' : ''} ${color}`}>
			{children}
		</div>
	);
};
