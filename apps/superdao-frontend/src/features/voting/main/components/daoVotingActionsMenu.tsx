import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button, DropdownMenu } from 'src/components';
import { snapshotSpaceUrl } from 'src/constants';
import { openExternal } from 'src/utils/urls';

type Props = {
	snapshotId: string | undefined;
	slug: string;
};

export const DaoVotingActionsMenu = ({ snapshotId, slug }: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const handleRedirectToCreateProposal = () => {
		push(`/${slug}/voting/create`);
	};
	const handleOpenSnapshotProposal = () => openExternal(`${snapshotSpaceUrl}${snapshotId}/create`);

	const options = [
		{
			label: t('components.dao.voting.createOnSuperdao'),
			onClick: handleRedirectToCreateProposal
		},
		{
			label: t('components.dao.voting.createOnSnapshot'),
			onClick: handleOpenSnapshotProposal
		}
	];

	return (
		<>
			{snapshotId ? (
				<DropdownMenu
					control={<Button size="md" label={t('components.dao.voting.addProposal')} color="accentPrimary" />}
					shouldCloseOnSelect
					options={options}
					className="hidden lg:block"
					data-testid={'ProposalsPage__createProposalButton'}
				/>
			) : (
				<Button
					className="hidden lg:block"
					size="md"
					label={t('components.dao.voting.addProposal')}
					color="accentPrimary"
					onClick={handleRedirectToCreateProposal}
					data-testid={'ProposalsPage__createProposalButton'}
				/>
			)}
		</>
	);
};
