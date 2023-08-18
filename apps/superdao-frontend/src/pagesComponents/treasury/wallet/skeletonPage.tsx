import { SkeletonDashboard } from './skeletonDashboard';
import { SkeletonAssetsBlock } from '../skeletonAssets';
import { SkeletonTxsBlock } from './skeletonTxs';
import { SkeletonNftsBlock } from './skeletonNfts';

export const SkeletonPage = () => (
	<>
		<SkeletonDashboard />
		<SkeletonAssetsBlock />
		<SkeletonNftsBlock />
		<SkeletonTxsBlock />
	</>
);
