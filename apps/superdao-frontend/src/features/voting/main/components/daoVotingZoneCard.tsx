import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { BanIcon, Button, Caption, DropdownMenu, ExternalLinkIcon, MoreIcon, Title3 } from 'src/components';
import { snapshotSpaceUrl } from 'src/constants';
import { useDaoBySlugWithRolesQuery, useUpdateDaoMutation } from 'src/gql/daos.generated';
import { mapDaoDataToUpdate } from 'src/hooks';
import { openExternal } from 'src/utils/urls';

type Props = {
	icon: ReactNode;
	heading: string;
	description: string;
	actionText: string;
	actionCallback: () => void;
	daoId?: string;
	slug?: string;
	dataTestId?: string;
};

export const DaoVotingZoneCard = ({
	icon,
	heading,
	description,
	actionText,
	actionCallback,
	daoId,
	slug,
	dataTestId
}: Props) => {
	const { t } = useTranslation();

	const { mutate } = useUpdateDaoMutation();
	const { data: daoData, refetch } = useDaoBySlugWithRolesQuery({ slug: slug! }, { enabled: !!slug });
	const { daoBySlug: dao } = daoData || {};

	const handleDisconnectSnapshot = () => {
		const mappedDao = dao ? mapDaoDataToUpdate(dao) : dao;

		mutate(
			{ updateDaoData: { ...mappedDao, id: daoId!, ensDomain: null } },
			{
				onSuccess: () => {
					refetch();
				}
			}
		);
	};
	const handleOpenSnapshot = () => openExternal(`${snapshotSpaceUrl}${dao?.ensDomain ?? ''}`);

	const options = [
		{
			label: t('components.dao.voting.openSnapshot'),
			before: <ExternalLinkIcon width={20} height={20} />,
			onClick: handleOpenSnapshot
		},
		{
			label: t('components.dao.voting.disconnect'),
			before: <BanIcon width={21} height={21} />,
			onClick: handleDisconnectSnapshot
		}
	];

	return (
		<div className="bg-backgroundSecondary relative flex-1 rounded-lg p-5" data-testid={dataTestId}>
			{icon}
			<Title3 className="mt-3" data-testid={'DaoVotingZoneCard__heading'}>
				{heading}
			</Title3>
			<Caption className="text-foregroundSecondary mt-1" data-testid={'DaoVotingZoneCard__description'}>
				{description}
			</Caption>
			<Button
				className="mt-6"
				size="lg"
				color="accentPrimary"
				label={actionText}
				onClick={actionCallback}
				data-testid={'DaoVotingZoneCard__button'}
			/>
			{dao?.ensDomain && (
				<div className="absolute top-5 right-5 cursor-pointer" data-testid={'DaoVotingZoneCard__dropdownMenu'}>
					<DropdownMenu control={<MoreIcon />} shouldCloseOnSelect options={options} />
				</div>
			)}
		</div>
	);
};
