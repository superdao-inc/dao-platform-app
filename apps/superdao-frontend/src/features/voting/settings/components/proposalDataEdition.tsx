import { FieldErrors, UseFormGetValues, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'next-i18next';

import { Duration } from 'luxon';
import { parseDate } from '../../internal/helpers';
import { DatepickerMode } from './datePickerModal';

import {
	Input,
	ShareIcon,
	Textarea,
	VotingAttachmentUploader,
	CustomSelect,
	Label1,
	Label3,
	IconButton,
	CrossIcon,
	Caption,
	AddBoldIcon,
	DefaultSelectProps,
	CustomSelectProps,
	Body
} from 'src/components';
import { ProposalVotingType } from 'src/types/types.generated';
import { ProposalFields } from 'src/validators/proposals';

type Props = {
	register: UseFormRegister<ProposalFields>;
	errors: FieldErrors<ProposalFields>;
	getValues: UseFormGetValues<ProposalFields>;
	handleNewAttachement: (attachmentId: string | undefined) => void;
	handleSelectVotingType: (selectValue: Pick<CustomSelectProps<DefaultSelectProps>, 'name' | 'value'>) => void;
	handleDeleteOption: (index: number) => void;
	handleAddOption: () => void;
	bindSwitchDateModalMode: (mode: DatepickerMode) => () => void;
	bindTimeChangeMode: (
		mode: DatepickerMode
	) => (selectValue: Pick<CustomSelectProps<DefaultSelectProps>, 'name' | 'value'>) => void;
	timeDifference: Duration;
	selectTimeOptions: DefaultSelectProps[];
	startTimeValue: DefaultSelectProps;
	endTimeValue: DefaultSelectProps;
};

export const ProposalDataEdition = ({
	register,
	errors,
	getValues,
	handleNewAttachement,
	handleSelectVotingType,
	handleDeleteOption,
	handleAddOption,
	bindSwitchDateModalMode,
	bindTimeChangeMode,
	timeDifference,
	selectTimeOptions,
	startTimeValue,
	endTimeValue
}: Props) => {
	const { t } = useTranslation();

	const selectVotingTypeOptions: DefaultSelectProps[] = [
		{
			value: ProposalVotingType.YesNoAbstain,
			label: <Body>{t('components.dao.voting.edition.votingType.yesNoAbstain')}</Body>
		},
		{
			value: ProposalVotingType.SingleChoice,
			label: <Body>{t('components.dao.voting.edition.votingType.single')}</Body>
		},
		{
			value: ProposalVotingType.MultipleChoice,
			label: <Body>{t('components.dao.voting.edition.votingType.multiple')}</Body>
		}
	];

	return (
		<div>
			<div>
				<div className={`transition-all ${errors.title?.message ? 'mb-12 ' : 'mb-6'}`}>
					<Input
						label={t('components.dao.voting.edition.title.heading')}
						placeholder={t('components.dao.voting.edition.title.placeholder')}
						error={errors.title?.message}
						{...register('title', {
							required: true
						})}
					/>
				</div>

				<div className="mb-3">
					<Textarea
						className="min-h-[90px]"
						label={t('components.dao.voting.edition.description.heading')}
						placeholder={t('components.dao.voting.edition.description.placeholder')}
						{...register('description')}
					/>
				</div>

				<div className="mb-6">
					<VotingAttachmentUploader
						imageWrapperClassName="my-3 max-w-[520px] max-h-[260px]"
						imageClassName="max-w-[520px] max-h-[260px]"
						content={t('components.dao.voting.edition.upload')}
						onChange={handleNewAttachement}
						currentFile={getValues('attachment')}
						before={<ShareIcon width={16} height={16} />}
					/>
				</div>

				<div className="mb-6">
					<Label1 className="my-2">{t('components.dao.voting.edition.votingType.heading')}</Label1>
					<CustomSelect
						cellsSize="sm"
						className="max-w-[274px]"
						name="selectVotingType"
						placeholder={t('components.dao.voting.edition.votingType.heading')}
						onChange={handleSelectVotingType}
						value={
							getValues('votingType')
								? selectVotingTypeOptions.find((option) => option.value === getValues('votingType'))
								: selectVotingTypeOptions[0]
						}
						options={selectVotingTypeOptions}
					/>
					<div>
						{getValues('votingType') !== ProposalVotingType.YesNoAbstain &&
							getValues('choices').map((_, index) => (
								// eslint-disable-next-line react/no-array-index-key
								<div key={index} className="mt-2 flex w-full items-center gap-4">
									<div className={`w-full transition-all ${errors?.choices?.[index] ? 'mb-6 ' : 'mb-0'}`}>
										<Input
											autoComplete="off"
											placeholder={t('components.dao.voting.edition.option', { index: index + 1 })}
											error={errors?.choices?.[index] && errors?.choices[index]?.name?.message}
											{...register(`choices.${index}.name`, {
												required: true
											})}
										/>
									</div>
									{getValues('choices').length > 2 && (
										<IconButton
											className={`transition-all ${errors?.choices?.[index] ? 'mb-6 ' : 'mb-0'}`}
											onClick={() => handleDeleteOption(index)}
											size="md"
											color="transparent"
											icon={<CrossIcon width={20} height={20} />}
										/>
									)}
								</div>
							))}
						{getValues('votingType') !== ProposalVotingType.YesNoAbstain && (
							<>
								{getValues('choices').length === 2 && (
									<Caption className="text-foregroundTertiary mt-2">
										{t('components.dao.voting.edition.optionsMinimum')}
									</Caption>
								)}
								<div
									className="mt-6 flex w-max cursor-pointer items-center gap-2"
									onClick={handleAddOption}
									data-testid={'ProposalCreate__AddOptionButton'}
								>
									<AddBoldIcon width={16} height={16} />
									<Label1>{t('components.dao.voting.edition.optionsAdd')}</Label1>
								</div>
							</>
						)}
					</div>
				</div>

				<div className="mb-6 flex gap-4">
					<div className="w-[272px]">
						<Label1 className="mb-2">{t('components.dao.voting.edition.starts')}</Label1>
						{!getValues('startAt') ? (
							<div
								className="bg-overlayTertiary flex h-10 cursor-pointer items-center justify-between rounded-lg py-2 px-4"
								onClick={bindSwitchDateModalMode(DatepickerMode.Start)}
								data-testid={'ProposalCreate__CalendarPicker'}
							>
								<Label1>{t('components.dao.voting.edition.now')}</Label1>
								<Label3 className="text-foregroundTertiary">{t('components.dao.voting.edition.selectDate')}</Label3>
							</div>
						) : (
							<div className="flex gap-2">
								<Body
									onClick={bindSwitchDateModalMode(DatepickerMode.Start)}
									className="bg-overlayTertiary text-foregroundPrimary h-10 w-[134px] cursor-pointer rounded-lg py-2 px-4"
									data-testid={'ProposalCreate__StartDate'}
								>
									{parseDate(new Date(getValues('startAt')))}
								</Body>
								<CustomSelect
									cellsSize="sm"
									className="flex-1"
									name="selectVotingStartTime"
									placeholder={t('components.dao.voting.edition.selectTime')}
									onChange={bindTimeChangeMode(DatepickerMode.Start)}
									value={startTimeValue}
									options={selectTimeOptions}
									menuPlacement={'top'}
								/>
							</div>
						)}
					</div>
					<div className="w-[272px]">
						<Label1 className="mb-2 flex gap-1">
							{t('components.dao.voting.edition.ends')}
							<span className="text-foregroundTertiary">
								{(timeDifference.toObject().days ?? 0) > 0
									? t('components.dao.voting.edition.endingDays', { count: timeDifference.toObject().days ?? 0 })
									: t('components.dao.voting.edition.endingHours')}
							</span>
						</Label1>
						{!getValues('endAt') ? (
							<div
								className="bg-overlayTertiary flex h-10 cursor-pointer items-center justify-between rounded-lg py-2 px-4"
								onClick={bindSwitchDateModalMode(DatepickerMode.End)}
							>
								<Label1>{t('components.dao.voting.edition.now')}</Label1>
								<Label3 className="text-foregroundTertiary">{t('components.dao.voting.edition.selectDate')}</Label3>
							</div>
						) : (
							<div className="flex gap-2">
								<Body
									onClick={bindSwitchDateModalMode(DatepickerMode.End)}
									className="bg-overlayTertiary text-foregroundPrimary h-10 w-[134px] cursor-pointer rounded-lg py-2 px-4"
									data-testid={'ProposalCreate__EndDate'}
								>
									{parseDate(new Date(getValues('endAt')))}
								</Body>
								<CustomSelect
									cellsSize="sm"
									className="flex-1"
									name="selectVotingEndTime"
									placeholder={t('components.dao.voting.edition.selectTime')}
									onChange={bindTimeChangeMode(DatepickerMode.End)}
									value={endTimeValue}
									options={selectTimeOptions}
									menuPlacement={'top'}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
