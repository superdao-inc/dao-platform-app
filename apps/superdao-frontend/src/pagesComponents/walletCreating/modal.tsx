import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';

import cn from 'classnames';
import { Title2, SubHeading, Label1, Loader, CheckIcon, ClockIcon, Caption } from 'src/components';
import { Modal, ModalContent } from 'src/components/baseModal';
import { colors } from 'src/style';
import { Mascot } from './mascot';
import { walletCreationSteps } from './constants';
import { getWalletClass } from 'src/pagesComponents/walletCreating/style';

type Props = {
	isOpen: boolean;
	step: number;
};

const modalStyle = {
	content: { minHeight: 520, minWidth: 400 }
};

export const StepsModal = ({ isOpen, step }: Props) => {
	const { t } = useTranslation();

	return (
		<Modal style={modalStyle} isOpen={isOpen}>
			<ModalContent withFooter={false}>
				<div className="flex content-around">
					<Mascot step={step} />
				</div>

				<div className="mb-3 flex">
					<Title2 className="mx-auto" color={colors.foregroundPrimary}>
						{t('components.treasury.createSafe.stepsModal.title')}
					</Title2>
				</div>
				<div className="mb-[28px] flex">
					<SubHeading className="mx-auto"> {t('components.treasury.createSafe.stepsModal.description')}</SubHeading>
				</div>
				<SafeCreationSteps step={step} />
			</ModalContent>
		</Modal>
	);
};

const stepStatuses = {
	notStarted: 'notStarted',
	inProgress: 'inProgress',
	done: 'done'
};

export const SafeCreationSteps = ({ step }: { step: number }) => {
	const { t } = useTranslation();

	const steps = [
		{
			label: t('components.treasury.createSafe.stepsModal.fillingFormStep'),
			status: stepStatuses.done
		},
		{
			label: t('components.treasury.createSafe.stepsModal.signingStep'),
			status: step === walletCreationSteps.signing ? stepStatuses.inProgress : stepStatuses.done,
			description: t('components.treasury.createSafe.stepsModal.signingDescription')
		},
		{
			label: t('components.treasury.createSafe.stepsModal.pendingStep'),
			status:
				step === walletCreationSteps.pending
					? stepStatuses.inProgress
					: step === walletCreationSteps.adding || step === walletCreationSteps.finishing
					? stepStatuses.done
					: stepStatuses.notStarted
		},
		{
			label: t('components.treasury.createSafe.stepsModal.addingStep'),
			status:
				step === walletCreationSteps.adding
					? stepStatuses.inProgress
					: step === walletCreationSteps.finishing
					? stepStatuses.done
					: stepStatuses.notStarted
		},
		{
			label: t('components.treasury.createSafe.stepsModal.finishingStep'),
			status: step === walletCreationSteps.finishing ? stepStatuses.inProgress : stepStatuses.notStarted
		}
	];

	const statusIcons: {
		[key in string]: ReactElement;
	} = {
		notStarted: <div className={cn('bg-foregroundTertiary h-2 w-2 rounded-[50%]')} />,
		inProgress: <Loader color="light" size="sm" />,
		done: <CheckIcon fill={colors.foregroundPrimary} />
	};

	const { circleClass } = getWalletClass();

	const statusCircles = (status: string) => {
		return status === stepStatuses.notStarted ? colors.backgroundTertiary : colors.accentPrimary;
	};

	const heightSize = (size: string) => {
		return size === 'md' ? '45px' : '24px';
	};

	const marginTop = (size: string) => {
		return size === 'md' ? '-18px' : '0';
	};

	const backgroundColor = (status: string) => {
		return status === stepStatuses.inProgress
			? `linear-gradient(180deg, ${colors.accentPrimary} 0%, ${colors.backgroundTertiary} 100%)`
			: status === stepStatuses.done
			? colors.accentPrimary
			: colors.backgroundTertiary;
	};

	return (
		<>
			{steps.map(({ label, description, status }, key) => {
				return (
					<div key={label} className=" mb-1">
						<div className="flex gap-3">
							<div className={circleClass} style={{ backgroundColor: statusCircles(status) }}>
								{statusIcons[status]}
							</div>
							<div>
								<Label1
									className="mb-1"
									color={status === stepStatuses.notStarted ? colors.foregroundTertiary : colors.foregroundPrimary}
								>
									{label}
								</Label1>
								<div className="flex items-center gap-2">
									{description && <ClockIcon fill={colors.overlayQuarternary} />}
									<Caption color={colors.overlayQuarternary}>{description}</Caption>
								</div>
							</div>
						</div>
						{key !== steps.length - 1 && (
							<div className={`mt-1 w-[24px]`}>
								<div
									className="mx-auto w-0.5"
									style={{
										height: heightSize(description ? 'md' : 'sm'),
										marginTop: marginTop(description ? 'md' : 'sm'),
										background: backgroundColor(status)
									}}
								/>
							</div>
						)}
					</div>
				);
			})}
		</>
	);
};
