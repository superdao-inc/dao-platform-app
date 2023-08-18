import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { DaoSnapshotIntegratedModal } from 'src/components/modals/daoSnapshotIntegratedModal';
import { PageContent, PageLoader, Title1 } from 'src/components';
import { AuthAPI } from 'src/features/auth/API';
import { useCurrentUserMemberRoleQuery } from 'src/gql/daoMembership.generated';
import { DaoMemberZone } from 'src/pagesComponents/dao/daoMemberZone';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { useSwitch } from 'src/hooks';
import { SnapshotApi } from 'src/features/snapshot/API';
import { DaoVotingArea } from 'src/features/voting/main/components/daoVotingArea';
import { CustomHead } from 'src/components/head';
import { isAdmin } from 'src/utils/roles';

type Props = {
	slug: string;
	daoId: string;
};

export const VotingMain = ({ slug, daoId }: Props) => {
	const { t } = useTranslation();
	const { query, replace } = useRouter();
	const [isIntegratedModalVisible, { off }] = useSwitch(Boolean(query.justIntegrated));

	const closeIntegratedModal = () => {
		replace(`/${slug}/voting`);
		off();
	};

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: memberRoleData } = useCurrentUserMemberRoleQuery({ daoId });
	const { currentUserMemberRole } = memberRoleData || {};
	const isCreator = isAdmin(currentUserMemberRole);

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: dao } = daoData || {};

	const { data, isLoading: isSnapshotLoading } = SnapshotApi.useSnapshotSpaceQuery(
		{ id: dao?.ensDomain || '' },
		{ enabled: !!dao?.ensDomain }
	);

	if (!dao || !dao.isVotingEnabled) return null;
	const { name, description, avatar } = dao;

	if (isSnapshotLoading || isDaoLoading) {
		return (
			<PageContent className="items-center">
				<CustomHead main={name} additional={'Voting'} description={description} avatar={avatar} />
				<PageLoader />
			</PageContent>
		);
	}

	console.log('isAuthorized', isAuthorized);

	if (!currentUserMemberRole || !isAuthorized) {
		return (
			<PageContent>
				<CustomHead main={name} additional={'Voting'} description={description} avatar={avatar} />

				<Title1 className="mb-6 hidden lg:block">{t('pages.voting.title')}</Title1>

				<DaoMemberZone isAuthorized={isAuthorized} whitelistUrl={dao?.whitelistUrl ?? ''} />
			</PageContent>
		);
	}

	return (
		<PageContent>
			<CustomHead main={name} additional={'Voting'} description={description} avatar={avatar} />

			<DaoSnapshotIntegratedModal isOpen={isIntegratedModalVisible} onClose={closeIntegratedModal} />

			<DaoVotingArea
				slug={slug}
				daoId={daoId}
				space={data?.space ?? undefined}
				ensDomain={dao.ensDomain}
				isCreator={isCreator}
			/>
		</PageContent>
	);
};
