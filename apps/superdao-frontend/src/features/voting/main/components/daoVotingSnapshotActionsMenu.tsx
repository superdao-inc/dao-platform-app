import { useTranslation } from 'next-i18next';
import { useQueryClient } from 'react-query';
import { BanIcon, Button, DropdownMenu, ExternalLinkIcon, SnapshotIcon } from 'src/components';
import { snapshotSpaceUrl } from 'src/constants';
import { useDaoBySlugWithRolesQuery, useUpdateDaoMutation } from 'src/gql/daos.generated';
import { mapDaoDataToUpdate } from 'src/hooks';
import { openExternal } from 'src/utils/urls';

type Props = {
	daoId: string;
	slug: string;
	snapshotId: string;
};

export const DaoVotingSnapshotActionsMenu = ({ snapshotId, daoId, slug }: Props) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { mutate } = useUpdateDaoMutation();
	const { data: daoData, refetch } = useDaoBySlugWithRolesQuery({ slug: slug });
	const { daoBySlug } = daoData || {};

	const handleDisconnectSnapshot = () => {
		const mappedDao = daoBySlug ? mapDaoDataToUpdate(daoBySlug) : daoBySlug;

		mutate(
			{ updateDaoData: { ...mappedDao, id: daoId, ensDomain: null } },
			{
				onSuccess: async () => {
					refetch();
					await queryClient.resetQueries('snapshotProposals.infinite');
				}
			}
		);
	};
	const handleOpenSnapshot = () => openExternal(`${snapshotSpaceUrl}${snapshotId}`);

	const options = [
		{
			label: t('components.dao.voting.openSnapshot'),
			before: <ExternalLinkIcon width={24} height={24} />,
			onClick: handleOpenSnapshot
		},
		{
			label: t('components.dao.voting.disconnect'),
			before: <BanIcon width={24} height={24} />,
			onClick: handleDisconnectSnapshot
		}
	];

	return (
		<DropdownMenu
			className="hidden lg:flex"
			control={
				<Button
					leftIcon={<SnapshotIcon width={16} height={16} />}
					label={snapshotId}
					color="overlaySecondary"
					size="md"
					data-testid={'ProposalsPage__snapshotDropdownMenu'}
				/>
			}
			options={options}
		/>
	);
};
