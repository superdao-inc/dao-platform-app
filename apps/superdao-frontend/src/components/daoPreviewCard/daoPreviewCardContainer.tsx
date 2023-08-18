import { useDaoPreviewByIdQuery, useDaoVerificationStatusQuery } from 'src/gql/daos.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';

import { DaoPreviewCardComponent } from './daoPreviewCardComponent';

type Props = {
	daoId: string;
	daoAddress: string | null;
	isPopup?: boolean;
	className?: string;
};

export const DaoPreviewCardContainer = (props: Props) => {
	const { daoId, daoAddress, isPopup, className } = props;

	const { data: daoVerification, isLoading: isDaoVerificationLoading } = useDaoVerificationStatusQuery(
		{ daoId },
		{ enabled: !!daoId }
	);
	const { daoVerificationStatus } = daoVerification || {};

	const { data: daoData } = useDaoPreviewByIdQuery({ id: daoId }, { enabled: !!daoId });
	const { daoById } = daoData || {};

	const { data: collectionData, isLoading: isCollectionLoading } = useNftCollectionQuery(
		{ daoAddress: daoAddress! },
		{ enabled: !!daoAddress }
	);
	const { collection } = collectionData || {};

	if (!daoById) return null;

	const { name, description, membersCount, avatar } = daoById;

	return (
		<DaoPreviewCardComponent
			daoId={daoId}
			name={name}
			description={description}
			membersCount={membersCount}
			avatar={avatar}
			isDaoVerified={!!daoVerificationStatus}
			tiers={collection?.tiers.filter((tier) => !tier.isDeactivated)}
			isCollectionLoading={isCollectionLoading}
			isDaoVerificationLoading={isDaoVerificationLoading}
			isPopup={isPopup}
			className={className}
		/>
	);
};
