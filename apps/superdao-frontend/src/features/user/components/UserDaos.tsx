import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { shrinkWallet } from '@sd/superdao-shared';

import { EmptyDaos } from 'src/components/daos/emptyDaos';
import { DaosList } from 'src/components/daos/daosList';
import { PageContent } from 'src/components/pageContent';
import { UserAPI } from 'src/features/user/API';
import { CustomHead } from 'src/components/head';
import { Title1 } from 'src/components';
import { MobileHeader } from 'src/components/mobileHeader';
import { useUserDaoParticipationQuery } from 'src/gql/user.generated';

import { getDaoMemberPath } from '../constants';

type Props = {
	slug: string;
	userId: string;
	isDaoTab?: boolean;
	backPath?: string;
};

export const UserDaos = ({ slug, userId, isDaoTab, backPath }: Props) => {
	const { t } = useTranslation();
	const { push, query } = useRouter();
	const { slug: daoSlug } = query;

	const { data: user } = UserAPI.useUserByIdOrSlugQuery({ idOrSlug: slug });
	const { userByIdOrSlug: userData } = user || {};

	const { data: userDaos } = useUserDaoParticipationQuery({ userId });
	const { daoParticipation: userDaosData } = userDaos || {};

	if (!userData || !userDaosData) return null;

	const { walletAddress, displayName, ens, avatar } = userData;
	const name = displayName || shrinkWallet(ens || walletAddress);
	const daos = userDaosData.items;

	const handleBack = () => {
		if (isDaoTab) {
			push(getDaoMemberPath(daoSlug as string, slug || userId));
			return;
		}
		push(backPath ?? '');
	};

	return (
		<PageContent onBack={handleBack}>
			<CustomHead main={name} additional="DAOs" description={'User daos'} avatar={avatar} />

			<MobileHeader title={t('pages.userDaos.title')} onBack={handleBack} />
			<Title1 className="mb-6 hidden lg:block">{t('pages.userDaos.title')}</Title1>

			{daos.length > 0 ? (
				<DaosList daos={daos} />
			) : (
				<EmptyDaos displayName={displayName} walletAddress={walletAddress} />
			)}
		</PageContent>
	);
};
