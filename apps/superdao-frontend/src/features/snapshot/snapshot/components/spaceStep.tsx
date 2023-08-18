import { useTranslation } from 'next-i18next';

import styled from '@emotion/styled';

import { ActionBlock, Button, DoneIcon, ErrorIcon, Label1, Label2, Loader } from 'src/components';
import { colors } from 'src/style';
import { SnapshotApi } from 'src/features/snapshot/API';
import { ipfsToHttpUrl } from 'src/utils/ipfsToHttpUrl';
import { StepProps } from 'src/features/snapshot/namespace';
import { snapshotCreationGuide } from 'src/constants';
import { openExternal } from 'src/utils/urls';
import { useUpdateDaoMutation } from 'src/gql/daos.generated';

import { mapDaoDataToUpdate } from 'src/hooks';

export const SpaceStep = (props: StepProps) => {
	const { onStepSuccess, onBack, snapshotEnsDomain, dao } = props;
	const { id: daoId } = dao;

	const { t } = useTranslation();

	const { mutate: updateDao, isLoading: isDaoUpdating } = useUpdateDaoMutation();
	const { data, isLoading, isRefetching, refetch } = SnapshotApi.useSnapshotSpaceQuery(
		{ id: snapshotEnsDomain },
		{
			onError: (error) => {}
		}
	);
	const { space } = data ?? {};

	const spaceError = !space;
	const isDataLoading = isLoading || isRefetching;

	let actionTitle: string;
	let actionSubtitle: any;
	let actionIcon: any;

	if (isDataLoading) {
		actionTitle = t('components.dao.voting.integration.spaceStep.progress.label');
		actionSubtitle = t('components.dao.voting.integration.spaceStep.progress.description');
		actionIcon = (
			<div className="p-2">
				<Loader size="22" />
			</div>
		);
	} else {
		actionTitle = spaceError ? t('components.dao.voting.integration.spaceStep.error.label') : space.name ?? '';
		actionSubtitle = spaceError ? t('components.dao.voting.integration.spaceStep.error.description') : space.id ?? '';
		actionIcon = spaceError ? (
			<div className="p-2">
				<ErrorIcon />
			</div>
		) : (
			space &&
			space.avatar && <img className="h-10 w-10 rounded-full" src={ipfsToHttpUrl(space.avatar) ?? ''} alt={space.id} />
		);
	}

	const action =
		!isDataLoading &&
		(spaceError ? (
			<div onClick={() => refetch()}>
				<StyledAction>{t('components.dao.voting.integration.spaceStep.tryAgain')}</StyledAction>
			</div>
		) : (
			<DoneIcon fill={colors.accentPositive} />
		));

	const handleSubmit = () => {
		const mappedDao = mapDaoDataToUpdate(dao);
		updateDao(
			{ updateDaoData: { ...mappedDao, id: daoId, ensDomain: snapshotEnsDomain } },
			{
				onSuccess: () => {
					refetch().then(() => onStepSuccess());
				},
				onError: (error) => {}
			}
		);
	};

	const isBtnDisabled = isDaoUpdating || isDataLoading;
	const isSubmitBtnDisabled = isBtnDisabled || spaceError;

	return (
		<>
			<h1 className="text-foregroundPrimary mb-2 text-4xl font-bold not-italic tracking-[.01em]">
				{t('components.dao.voting.integration.spaceStep.heading')}
			</h1>
			<StyledLabel1>
				{t('components.dao.voting.integration.spaceStep.description')}{' '}
				<StyledLink onClick={() => openExternal(snapshotCreationGuide)}>
					{t('components.dao.voting.integration.spaceStep.link')}
				</StyledLink>
			</StyledLabel1>

			<ActionBlock
				className="my-8 px-4 py-3"
				title={actionTitle}
				subtitle={actionSubtitle}
				icon={actionIcon}
				action={action}
			/>

			<div className="mt-3 flex items-center gap-3">
				<StyledButton
					color="accentPrimary"
					size="lg"
					label={t('components.dao.voting.integration.spaceStep.action')}
					onClick={handleSubmit}
					disabled={isSubmitBtnDisabled}
				/>

				<Button
					size="lg"
					label={t('pages.createDao.backLabel')}
					color="transparent"
					onClick={onBack}
					disabled={isBtnDisabled}
				/>
			</div>
		</>
	);
};

const StyledLabel1 = styled(Label1)`
	margin-bottom: 32px;
	color: ${colors.foregroundSecondary};
`;

const StyledButton = styled(Button)`
	width: max-content;
`;

const StyledLink = styled.span`
	cursor: pointer;
	color: ${colors.accentPrimary};
`;

const StyledAction = styled(Label2)`
	color: ${colors.accentPrimary};
	cursor: pointer;
`;
