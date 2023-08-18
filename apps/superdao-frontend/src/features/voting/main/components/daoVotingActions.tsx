import { useTranslation } from 'next-i18next';

import { DaoVotingSnapshotActionsMenu } from './daoVotingSnapshotActionsMenu';
import { DaoVotingActionsMenu } from './daoVotingActionsMenu';

import { Title1 } from 'src/components';
import { MobileHeader } from 'src/components/mobileHeader';

type Props = {
	daoId: string;
	slug: string;
	snapshotId: string | undefined;
	isCreator: boolean;
};

export const DaoVotingActions = ({ snapshotId, isCreator, slug, daoId }: Props) => {
	const { t } = useTranslation();

	return (
		<div className="flex w-full items-center justify-between">
			<Title1 className="hidden lg:block" data-testid={'ProposalPage__title'}>
				{t('pages.voting.title')}
			</Title1>
			<MobileHeader withBurger title={t('pages.voting.title')} />
			<div className="flex lg:gap-3">
				{isCreator && snapshotId && <DaoVotingSnapshotActionsMenu snapshotId={snapshotId} slug={slug} daoId={daoId} />}
				{isCreator && <DaoVotingActionsMenu snapshotId={snapshotId} slug={slug} />}
			</div>
		</div>
	);
};
