import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'next-i18next';
import { DateTime } from 'luxon';

import { ProposalPreview } from '../components/proposalPreview';
import { DatePickerModal, DatepickerMode } from '../components/datePickerModal';
import { ProposalDataEdition } from '../components/proposalDataEdition';

import { ExitProposalSettingsModal } from '../../proposal/components/exitProposalSettingsModal';
import {
	Button,
	PageContent,
	PageLoader,
	Title1,
	DefaultSelectProps,
	CustomSelectProps,
	toast,
	Body
} from 'src/components';
import { AuthAPI } from 'src/features/auth/API';
import { useCurrentUserMemberRoleQuery } from 'src/gql/daoMembership.generated';
import { ProposalStatus, ProposalVotingPowerType, ProposalVotingType } from 'src/types/types.generated';
import { DaoMemberZone } from 'src/pagesComponents/dao/daoMemberZone';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { useCreateProposalMutation, useEditProposalMutation, useGetProposalQuery } from 'src/gql/proposal.generated';
import { ProposalFields, proposalSchema } from 'src/validators/proposals';
import { CustomHead } from 'src/components/head';
import { isProposalPending } from '../../internal/helpers';

import { CHOICE_CONTENT_MAX_LENGTH, PROPOSAL_TITLE_MAX_LENGTH } from '@sd/superdao-shared';
import { isAdmin } from 'src/utils/roles';

type Props = {
	slug: string;
	daoId: string;
	proposalId?: string;
};

export const VotingSettings = ({ slug, daoId, proposalId }: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();
	const queryClient = useQueryClient();

	const isEditMode = !!proposalId;

	const [previewMode, setPreviewMode] = useState(false);
	const [dateModalState, updateDateModalState] = useState({ isOpen: false, mode: DatepickerMode.Start });

	const registerTimeOptions = (): DefaultSelectProps[] => {
		const amOptions: DefaultSelectProps[] = [];
		const pmOptions: DefaultSelectProps[] = [];

		amOptions.push({ value: '0', label: <Body>12:00</Body> });
		pmOptions.push({ value: '12', label: <Body>12:00</Body> });

		for (let i = 1; i <= 11; i++) {
			amOptions.push({ value: `${i}`, label: <Body>{t('components.dao.voting.edition.am', { date: i })}</Body> });
			pmOptions.push({ value: `${i + 12}`, label: <Body>{t('components.dao.voting.edition.pm', { date: i })}</Body> });
		}

		return [...amOptions, ...pmOptions];
	};

	const selectTimeOptions: DefaultSelectProps[] = registerTimeOptions();

	const [startTimeValue, setStartTimeValue] = useState(selectTimeOptions[selectTimeOptions.length - 2]);
	const [endTimeValue, setEndTimeValue] = useState(selectTimeOptions[selectTimeOptions.length - 2]);

	const [isExitModalOpen, setIsExitModalOpen] = useState(false);

	const { data: proposalQueryData, isLoading: isProposalLoading } = useGetProposalQuery(
		{ proposalId: proposalId ?? '' },
		{ enabled: isEditMode }
	);

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: memberRoleData } = useCurrentUserMemberRoleQuery({ daoId });
	const { currentUserMemberRole } = memberRoleData || {};
	const isCreator = isAdmin(currentUserMemberRole);

	const { data: daoData, isLoading: isDaoDataLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: dao } = daoData || {};

	const { mutate: createVoting } = useCreateProposalMutation();
	const { mutate: editVoting } = useEditProposalMutation();

	const endDate = new Date();
	endDate.setHours(22, 0, 0, 0);
	endDate.setDate(endDate.getDate() + 30);

	const {
		register,
		getValues,
		formState: { errors },
		setValue,
		watch,
		reset,
		trigger
	} = useForm<ProposalFields>({
		resolver: zodResolver(proposalSchema),
		mode: 'onChange',
		defaultValues: {
			title: proposalQueryData?.getProposal?.title ?? '',
			description: proposalQueryData?.getProposal?.description ?? '',
			attachment: proposalQueryData?.getProposal?.attachment ?? null,
			votingType: proposalQueryData?.getProposal?.votingType ?? ProposalVotingType.YesNoAbstain,
			votingPowerType: proposalQueryData?.getProposal?.votingPowerType ?? ProposalVotingPowerType.Single,
			startAt: proposalQueryData?.getProposal?.startAt ? new Date(proposalQueryData?.getProposal?.startAt) : undefined,
			endAt: proposalQueryData?.getProposal?.endAt ? new Date(proposalQueryData?.getProposal?.endAt) : endDate,
			choices: proposalQueryData?.getProposal?.choices ?? [
				{ name: t('pages.votingProposal.votingOptions.yes') },
				{ name: t('pages.votingProposal.votingOptions.no') },
				{ name: t('pages.votingProposal.votingOptions.abstain') }
			]
		}
	});

	useEffect(() => {
		if (proposalQueryData && proposalQueryData.getProposal) {
			if (!isProposalPending(proposalQueryData.getProposal)) {
				handleBack();
				return;
			}

			const { title, description, choices, attachment, votingType, votingPowerType, startAt, endAt } =
				proposalQueryData.getProposal;
			const initialValues = {
				title,
				description,
				choices: choices.map((choice: any) => ({ name: choice.name })),
				attachment,
				votingType,
				votingPowerType,
				startAt: new Date(startAt),
				endAt: new Date(endAt)
			};
			reset(initialValues);

			setStartTimeValue(selectTimeOptions[new Date(proposalQueryData?.getProposal.startAt).getHours()]);
			setEndTimeValue(selectTimeOptions[new Date(proposalQueryData?.getProposal.endAt).getHours()]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposalQueryData]);

	// Very slow and hard, need refactor
	watch(['title', 'description', 'attachment', 'votingType', 'choices', 'startAt', 'endAt']);

	const isValid =
		getValues('choices').filter((choice) => choice.name.trim()).length > 1 &&
		getValues('endAt') &&
		getValues('title').trim();

	useEffect(() => {
		if (!dao?.isVotingEnabled || !isCreator || (!proposalQueryData && !isProposalLoading && isEditMode)) {
			push(`/${slug}/voting`);
		}
	}, [dao, isCreator, isEditMode, isProposalLoading, proposalQueryData, push, slug]);

	const pageAdditionalHeading = isEditMode ? 'Voting editing' : 'Voting creating';

	if (isProposalLoading || isDaoDataLoading) {
		return (
			<PageContent>
				<CustomHead
					main={dao?.name ? dao?.name : pageAdditionalHeading}
					additional={dao?.name ? pageAdditionalHeading : 'Superdao'}
					description={'Create proposals on Superdao'}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	if (!currentUserMemberRole || !isAuthorized) {
		return (
			<PageContent>
				<CustomHead
					main={dao?.name ? dao?.name : pageAdditionalHeading}
					additional={dao?.name ? pageAdditionalHeading : 'Superdao'}
					description={'Create proposals on Superdao'}
				/>

				<DaoMemberZone isAuthorized={isAuthorized} whitelistUrl={dao?.whitelistUrl ?? ''} />
			</PageContent>
		);
	}

	const handleAction = () => {
		if (!sanitize()) return;

		if (isEditMode) {
			editVoting(
				{
					proposalId,
					proposal: {
						title: getValues('title'),
						description: getValues('description'),
						votingType: getValues('votingType'),
						votingPowerType: getValues('votingPowerType'),
						startAt: getValues('startAt'),
						endAt: getValues('endAt'),
						attachment: getValues('attachment'),
						daoId
					},
					createChoiceData: { choices: getValues('choices').filter((choice) => choice.name.trim()) }
				},
				{
					onSuccess: async (proposal) => {
						if (!proposal?.editProposal.id) {
							toast.error(t('components.dao.voting.edition.submitError'), { position: 'bottom-center' });
							return;
						}

						await queryClient.resetQueries('getAllProposals.infinite');
						await queryClient.resetQueries('snapshotProposals.infinite');
						await queryClient.resetQueries('getProposal');
						await queryClient.resetQueries('getVotes');
						await queryClient.resetQueries('getScores');

						push(`/${slug}/voting/${proposal.editProposal.id}?edited=1`);
					},
					onError: (error) => {}
				}
			);
		} else {
			createVoting(
				{
					proposal: {
						title: getValues('title'),
						description: getValues('description'),
						votingType: getValues('votingType'),
						votingPowerType: getValues('votingPowerType'),
						startAt: getValues('startAt'),
						endAt: getValues('endAt'),
						attachment: getValues('attachment')?.length ? getValues('attachment') : null,
						daoId
					},
					createChoiceData: { choices: getValues('choices').filter((choice) => choice.name.trim()) }
				},
				{
					onSuccess: async (proposal) => {
						if (!proposal?.createProposal.id) {
							toast.error(t('components.dao.voting.edition.submitError'), { position: 'bottom-center' });
							return;
						}

						await queryClient.resetQueries('getAllProposals.infinite');
						await queryClient.resetQueries('snapshotProposals.infinite');

						push(`/${slug}/voting/${proposal.createProposal.id}?created=1`);
					},
					onError: (error) => {}
				}
			);
		}
	};

	const sanitize = () => {
		if (!getValues('title').trim()) {
			toast(t('components.dao.voting.edition.hints.title.filled'));
			return false;
		}
		if (getValues('title').trim().length > PROPOSAL_TITLE_MAX_LENGTH) {
			toast(t('components.dao.voting.edition.hints.title.length', { count: PROPOSAL_TITLE_MAX_LENGTH }));
			return false;
		}
		if (!(getValues('choices').filter((choice) => choice.name.trim()).length > 1)) {
			toast(t('components.dao.voting.edition.hints.choices.filled'));
			return false;
		}
		if (!getValues('choices').every((choice) => choice.name.length <= CHOICE_CONTENT_MAX_LENGTH)) {
			toast(t('components.dao.voting.edition.hints.choices.length', { length: CHOICE_CONTENT_MAX_LENGTH }));
			return false;
		}
		const choices = getValues('choices')
			.filter((choice) => choice.name.trim())
			.map((choice) => choice.name);
		if (new Set(choices).size !== choices.length) {
			toast(t('components.dao.voting.edition.hints.choices.unique'));
			return false;
		}
		if (getValues('startAt') && getValues('startAt') <= new Date()) {
			toast(t('components.dao.voting.edition.hints.start.valid'));
			return false;
		}
		if (!getValues('endAt')) {
			toast(t('components.dao.voting.edition.hints.end.is'));
			return false;
		}
		if (getValues('endAt') <= getValues('startAt') || getValues('endAt') <= new Date()) {
			toast(t('components.dao.voting.edition.hints.end.valid'));
			return false;
		}
		return true;
	};

	const handleSwitchPreview = () => {
		if (!sanitize()) return;

		setPreviewMode(!previewMode);
	};

	const handleCloseDateModal = () => {
		updateDateModalState({ ...dateModalState, isOpen: false });
	};

	const bindSwitchDateModalMode = (mode: DatepickerMode) => {
		return () => {
			updateDateModalState({ isOpen: !dateModalState.isOpen, mode });
		};
	};

	const handleSubmitDateModal = (date: Date, mode: DatepickerMode) => {
		const specifiedDate = date;
		specifiedDate.setHours(22, 0, 0, 0);
		setValue(mode === DatepickerMode.Start ? 'startAt' : 'endAt', specifiedDate);
		if (mode === DatepickerMode.Start) {
			setStartTimeValue(selectTimeOptions[selectTimeOptions.length - 2]);
		} else {
			setEndTimeValue(selectTimeOptions[selectTimeOptions.length - 2]);
		}
	};

	const bindTimeChangeMode = (
		mode: DatepickerMode
	): ((selectValue: Pick<CustomSelectProps<DefaultSelectProps>, 'name' | 'value'>) => void) => {
		return (selectValue: Pick<CustomSelectProps<DefaultSelectProps>, 'name' | 'value'>) => {
			const date = getValues(mode === DatepickerMode.Start ? 'startAt' : 'endAt');
			date.setHours(0, 0, 0, 0);
			date.setHours(date.getHours() + +(selectValue.value as DefaultSelectProps).value);
			setValue(mode === DatepickerMode.Start ? 'startAt' : 'endAt', date);
			if (mode === DatepickerMode.Start) {
				setStartTimeValue(selectTimeOptions[+(selectValue.value as DefaultSelectProps).value]);
			} else {
				setEndTimeValue(selectTimeOptions[+(selectValue.value as DefaultSelectProps).value]);
			}
		};
	};

	const handleSelectVotingType = (selectValue: Pick<CustomSelectProps<DefaultSelectProps>, 'name' | 'value'>) => {
		if ((selectValue.value as DefaultSelectProps).value === ProposalVotingType.YesNoAbstain) {
			setValue('choices', [{ name: 'Yes' }, { name: 'No' }, { name: 'Obstain' }]);
		} else {
			setValue('choices', [{ name: '' }, { name: '' }]);
		}
		setValue('votingType', (selectValue.value as DefaultSelectProps).value as ProposalVotingType);
	};

	const handleDeleteOption = (index: number) => {
		let currentChoices = getValues('choices');
		currentChoices = currentChoices.filter((_, i) => i !== index);
		setValue('choices', currentChoices);
		trigger('choices');
	};

	const handleAddOption = () => {
		const currentChoices = getValues('choices');
		setValue('choices', [...currentChoices, { name: '' }]);
	};

	const handleNewAttachement = (attachmentId: string | undefined) => {
		setValue('attachment', attachmentId ?? null);
	};

	const toggleExitModal = () => {
		setIsExitModalOpen(!isExitModalOpen);
	};

	const handleBack = () => {
		push(`/${slug}/voting`);
	};

	const luxonNow = getValues('startAt')
		? DateTime.fromMillis(getValues('startAt').getTime())
		: DateTime.fromMillis(Date.now());
	const luxonEnd = DateTime.fromMillis(getValues('endAt').getTime());

	const endDiff = luxonEnd.diff(luxonNow, ['days', 'hours']);

	return (
		<PageContent columnSize={previewMode ? 'md' : 'sm'} withAccent={previewMode} onBack={toggleExitModal}>
			<CustomHead
				main={dao?.name ? dao?.name : pageAdditionalHeading}
				additional={dao?.name ? pageAdditionalHeading : 'Superdao'}
				description={'Create proposals on Superdao'}
			/>

			<Title1 className="mb-6" data-testid={previewMode ? 'DaoVoting__previewVotingTitle' : 'ProposalCreate__Title'}>
				{previewMode ? t('components.dao.voting.preview.heading') : t('components.dao.voting.settings')}
			</Title1>

			{previewMode ? (
				<ProposalPreview
					start={getValues('startAt') ? getValues('startAt').getTime() / 1000 : null}
					end={getValues('endAt').getTime() / 1000}
					status={getValues('startAt') ? ProposalStatus.Pending : ProposalStatus.Active}
					proposalName={getValues('title')}
					attachment={getValues('attachment') ?? null}
					proposalDescription={getValues('description')}
					daoId={daoId}
					avatar={daoData?.daoBySlug?.avatar ?? null}
					daoName={daoData?.daoBySlug?.name ?? ''}
					type={getValues('votingType')}
					votingPowerType={getValues('votingPowerType')}
					choices={getValues('choices')}
					onSwitch={handleSwitchPreview}
				/>
			) : (
				<ProposalDataEdition
					register={register}
					errors={errors}
					getValues={getValues}
					handleNewAttachement={handleNewAttachement}
					handleSelectVotingType={handleSelectVotingType}
					handleDeleteOption={handleDeleteOption}
					handleAddOption={handleAddOption}
					bindSwitchDateModalMode={bindSwitchDateModalMode}
					bindTimeChangeMode={bindTimeChangeMode}
					timeDifference={endDiff}
					selectTimeOptions={selectTimeOptions}
					startTimeValue={startTimeValue}
					endTimeValue={endTimeValue}
				/>
			)}

			<DatePickerModal
				isOpen={dateModalState.isOpen}
				mode={dateModalState.mode}
				onClose={handleCloseDateModal}
				onChange={handleSubmitDateModal}
				minimumDate={
					dateModalState.mode === DatepickerMode.Start ? new Date() : new Date(getValues('startAt') ?? new Date())
				}
			/>

			<ExitProposalSettingsModal onExit={handleBack} onCancel={toggleExitModal} isOpen={isExitModalOpen} />

			<div className="mt-8 flex gap-2">
				<Button
					size="lg"
					color="accentPrimary"
					label={
						proposalQueryData?.getProposal?.createdBySuperdao
							? t('actions.labels.editAndPublish')
							: t('actions.labels.publish')
					}
					onClick={handleAction}
					data-testid={'ProposalCreate__publishButton'}
				/>
				<Button
					size="lg"
					color="transparent"
					disabled={!isValid}
					label={previewMode ? t('actions.labels.cancel') : t('actions.labels.preview')}
					onClick={handleSwitchPreview}
					data-testid={previewMode ? 'ProposalCreate__cancelButton' : 'ProposalCreate__previewButton'}
				/>
			</div>
		</PageContent>
	);
};
