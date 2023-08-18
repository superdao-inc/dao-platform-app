import Link from 'next/link';

import { UserDaoParticipationQuery } from 'src/gql/user.generated';
import { DaoPreviewCard } from '../daoPreviewCard';

type Props = {
	daos: UserDaoParticipationQuery['daoParticipation']['items'];
	isShort?: boolean;
};

export const DaosList = (props: Props) => {
	const { daos, isShort } = props;

	const targetedDaos = isShort ? daos.slice(0, 3) : daos;
	const smallScreenDaoAppendix = isShort ? daos.slice(3, 4) : null;
	const smallScreenDaoContent = smallScreenDaoAppendix?.[0]?.dao;

	return (
		<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 lg:gap-5">
			{targetedDaos.map((member) => {
				const { id, dao, daoId } = member;
				const { slug, contractAddress } = dao;

				return (
					<Link key={id} href={`/${slug}`} passHref>
						<a
							className="bg-backgroundSecondary flex flex-col justify-between overflow-hidden rounded-lg"
							data-testid={`DaoItem__${slug}`}
						>
							<DaoPreviewCard daoId={daoId} daoAddress={contractAddress} />
						</a>
					</Link>
				);
			})}
			{!!smallScreenDaoContent && (
				<div className="lg:hidden">
					<Link href={`/${smallScreenDaoContent?.slug}`} passHref>
						<a
							className="bg-backgroundSecondary flex flex-col justify-between overflow-hidden rounded-lg"
							data-testid={`DaoItem__${smallScreenDaoContent?.slug}`}
						>
							<DaoPreviewCard
								daoId={smallScreenDaoContent?.id ?? ''}
								daoAddress={smallScreenDaoContent.contractAddress}
							/>
						</a>
					</Link>
				</div>
			)}
		</div>
	);
};
