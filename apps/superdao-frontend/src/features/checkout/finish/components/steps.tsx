import React, { FC, ReactElement } from 'react';
import { CurrentStepCircle, CurrentStepLoadingCircle, NextStepCircle, PrevStepCircle } from './circles';
import { Line } from './line';
import { Body, Button, Caption, Label1 } from 'src/components';
import { colors } from 'src/style';

export type StepData = {
	header: string;
	description: string;
	actionText: string;
	actionHint?: string;
	onActionClick: () => void;
};

export const PrevStep = (props: StepData) => {
	const { header } = props;
	const DotAndLine = (
		<>
			<div>
				<PrevStepCircle />
			</div>
			<Line type="active" />
		</>
	);

	return (
		<Step DotAndLine={DotAndLine}>
			<Label1>{header}</Label1>
			<div className="mb-8" />
		</Step>
	);
};

export const CurrentStep = (props: StepData & { isLastStep: boolean; isLoading?: boolean }) => {
	const { isLastStep, header, description, actionText, actionHint, isLoading = false, onActionClick } = props;
	const DotAndLine = (
		<>
			<div>{isLoading ? <CurrentStepLoadingCircle /> : <CurrentStepCircle />}</div>
			{!isLastStep && <Line type="progress" />}
		</>
	);

	return (
		<Step DotAndLine={DotAndLine}>
			<Label1>{header}</Label1>
			<Body className="text-foregroundSecondary">{description}</Body>
			<div className="text-foregroundPrimary mt-4 mb-5 flex items-center">
				<Button color="accentPrimary" size="md" onClick={onActionClick} disabled={isLoading}>
					{actionText}
				</Button>
				{isLoading && actionHint && (
					<div className="ml-4">
						<Caption color={colors.overlayQuarternary}>{actionHint}</Caption>
					</div>
				)}
			</div>
		</Step>
	);
};

export const NextStep = (props: StepData & { isLastStep: boolean }) => {
	const { isLastStep, header } = props;
	const DotAndLine = (
		<>
			<div>
				<NextStepCircle />
			</div>
			{!isLastStep && <Line type="inactive" />}
		</>
	);

	return (
		<Step DotAndLine={DotAndLine}>
			<Label1 color={colors.foregroundTertiary}>{header}</Label1>
			<div className="mb-8" />
		</Step>
	);
};

type StepProps = {
	DotAndLine: ReactElement;
	children: React.ReactNode;
};

const Step: FC<StepProps> = (props) => {
	const { DotAndLine, children } = props;
	return (
		<div className="mt-1 flex flex-row">
			<div className="flex flex-col items-center">{DotAndLine}</div>
			<div className="ml-4">{children}</div>
		</div>
	);
};
