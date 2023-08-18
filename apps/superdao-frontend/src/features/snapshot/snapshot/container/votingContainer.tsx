import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from '@emotion/styled';

import { useLeavePageConfirm } from 'src/hooks';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { PageContent } from 'src/components';
import { EnsStep } from 'src/features/snapshot/snapshot/components/ensStep';
import { SpaceStep } from 'src/features/snapshot/snapshot/components/spaceStep';
import { borders, colors } from 'src/style';
import { CustomHead } from 'src/components/head';

const steps = [EnsStep, SpaceStep];

export type VotingProps = {
	slug: string;
};

export const VotingContainer = (props: VotingProps) => {
	const { slug } = props;

	const { push } = useRouter();

	const [currentStep, setCurrentStep] = useState(0);
	const [needsLeaveConfirm, setNeedsLeaveConfirm] = useState(false);
	const [snapshotEnsDomain, setSnapshotEnsDomain] = useState('');

	useLeavePageConfirm(needsLeaveConfirm);

	const { data: daoData, refetch } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: dao } = daoData || {};
	if (!dao) return null;
	const { avatar, name, description } = dao;

	const handleStepReverse = () => {
		setCurrentStep((step) => step - 1);
	};

	const handleStepSubmit = () => {
		if (currentStep === steps.length - 1) {
			setNeedsLeaveConfirm(false);
			// Pushing redirect to next cycle of event loop to avoid leaving confirm modal open
			setTimeout(() => {
				push(`/${slug}/voting?justIntegrated=1`);
			}, 0);
			return;
		}

		setNeedsLeaveConfirm(true);
		setCurrentStep((step) => step + 1);
	};

	const StepComponent = steps[currentStep];

	const handleClose = () => {
		push(`/${slug}/voting`);
	};

	return (
		<PageContent columnSize="sm" onClose={handleClose}>
			<CustomHead main={name} additional={'Snapshot integration'} description={description} avatar={avatar} />

			<div className="absolute top-[38px] flex w-full gap-2">
				{steps.map((_, index) => (
					// eslint-disable-next-line react/no-array-index-key
					<StepProgressItem key={index} isActive={index === currentStep} />
				))}
			</div>

			<div className="flex h-full flex-col justify-center pt-[72px]">
				<StepComponent
					isLoading
					dao={dao}
					refetch={refetch}
					snapshotEnsDomain={snapshotEnsDomain}
					setSnapshotEnsDomain={setSnapshotEnsDomain}
					onStepSuccess={handleStepSubmit}
					onBack={handleStepReverse}
				/>
			</div>
		</PageContent>
	);
};

const StepProgressItem = styled.div<{ isActive?: boolean }>`
	flex: 1;

	height: 4px;
	border-radius: ${borders.medium};
	background: ${({ isActive }) => (isActive ? colors.foregroundPrimary : colors.foregroundQuaternary)};
`;
