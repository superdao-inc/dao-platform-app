import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { DaoVotingZoneCard } from './daoVotingZoneCard';
import { Body, Button, SnapshotIcon, Title1, Title3, VotingIcon } from 'src/components';
import { openExternal } from 'src/utils/urls';
import { snapshotSpaceUrl } from 'src/constants';

type Props = {
	ensDomain: string | null;
	slug: string;
	daoId: string;
	isCreator: boolean;
};

export const DaoVotingZone = ({ ensDomain, slug, daoId, isCreator }: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const handleCreateVotingOnSuperdao = () => {
		push(`/${slug}/voting/create`);
	};

	const handleCreateVotingOnSnapshot = () => {
		openExternal(`${snapshotSpaceUrl}${ensDomain}/create`);
	};

	const handleConnectSnapshot = () => {
		push(`/${slug}/voting/integration`);
	};

	const handleOpenSnapshot = () => openExternal(`${snapshotSpaceUrl}${ensDomain}`);

	if (!isCreator) {
		return (
			<>
				{ensDomain && (
					<div className="flex w-full justify-end">
						<Button
							leftIcon={<SnapshotIcon width={24} height={24} />}
							label={ensDomain}
							color="overlayTertiary"
							size="md"
							type="button"
							onClick={handleOpenSnapshot}
							className="mb-5"
						/>
					</div>
				)}
				<div className="bg-backgroundSecondary flex min-h-[464px] items-center justify-center rounded-lg">
					<div>
						<Image src="/assets/arts/emptyVotingArt.svg" width={228} height={136} />

						<Title1 className="mt-4 text-center" data-testid={'DaoVotingZone_title'}>
							{t('components.dao.votingBanner.title')}
						</Title1>
						<Body className="text-foregroundSecondary mt-2 text-center">
							{t('components.dao.votingBanner.descriptionMember')}
						</Body>
					</div>
				</div>
			</>
		);
	}

	return (
		<div className="pt-8">
			<Title3 className="mb-4">{t('pages.votingProposal.create')}</Title3>
			<div className="flex gap-5">
				<DaoVotingZoneCard
					icon={<VotingIcon />}
					heading={t('components.dao.voting.zone.cards.superdao.heading')}
					description={t('components.dao.voting.zone.cards.superdao.description')}
					actionText={t('components.dao.voting.zone.cards.superdao.actions.create')}
					actionCallback={handleCreateVotingOnSuperdao}
					dataTestId={'DaoVotingZoneCard__internalType'}
				/>
				<DaoVotingZoneCard
					icon={<SnapshotIcon width={48} height={48} />}
					heading={t('components.dao.voting.zone.cards.snapshot.heading')}
					description={t('components.dao.voting.zone.cards.snapshot.description')}
					actionText={
						ensDomain
							? t('components.dao.voting.zone.cards.snapshot.actions.create')
							: t('components.dao.voting.zone.cards.snapshot.actions.connect')
					}
					actionCallback={ensDomain ? handleCreateVotingOnSnapshot : handleConnectSnapshot}
					daoId={daoId}
					slug={slug}
					dataTestId={'DaoVotingZoneCard__snapshotType'}
				/>
			</div>
		</div>
	);
};
