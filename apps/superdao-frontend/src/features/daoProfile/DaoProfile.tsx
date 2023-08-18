import { memo } from 'react';
import { isAddress } from 'ethers/lib/utils';
import { usePublicTreasuryNftsQuery } from 'src/gql/treasury.generated';
import { DaoProfileShowcase } from 'src/features/daoProfile/showcase';
import { PublicDaoFragment } from 'src/gql/daos.generated';
import { DaoProfileNftCollections } from 'src/features/daoProfile/nftCollections';
import { DaoProfileActionBlock } from 'src/features/daoProfile/actionBlock';
import { DaoProfileHead } from 'src/features/daoProfile/head';

export type DaoProfileProps = {
	dao: PublicDaoFragment;
	isDaoVerified: boolean;
	isShowcaseVisible: boolean;

	hostname: string;
	protocol: string;
};

const DaoProfile = (props: DaoProfileProps) => {
	const { dao, isDaoVerified, isShowcaseVisible, protocol, hostname } = props;

	const { id, slug, contractAddress, openseaUrl } = dao;

	const { data: treasuryNfts, isLoading: areTreasuryNftsLoading } = usePublicTreasuryNftsQuery(
		{ daoId: id },
		{ select: (data) => data.treasury?.nfts, enabled: isShowcaseVisible }
	);

	return (
		<>
			<DaoProfileHead dao={dao} isDaoVerified={isDaoVerified} hostname={hostname} protocol={protocol} />

			<DaoProfileActionBlock daoSlug={slug} className="mt-4" />

			{isShowcaseVisible && !!treasuryNfts?.length && (
				<DaoProfileShowcase
					daoId={id}
					daoSlug={slug}
					treasuryNfts={treasuryNfts}
					isLoading={areTreasuryNftsLoading}
					className="mt-8"
				/>
			)}

			{contractAddress && isAddress(contractAddress) && (
				<DaoProfileNftCollections
					daoId={id}
					daoSlug={slug}
					daoAddress={contractAddress}
					openseaUrl={openseaUrl}
					className="mt-8"
				/>
			)}
		</>
	);
};

export default memo(DaoProfile);
