import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { SkeletonMobileNft } from '../wallet/skeletonNfts';

export const MobileNftsPageSkeleton = () => (
	<>
		<SkeletonComponent variant="rectangular" className="rounded" width={80} height={20} />

		<div className="mb-5 flex flex-col rounded-lg">
			<div className="mt-4 grid grid-cols-2 gap-2 gap-y-5 sm:gap-5 md:grid-cols-3">
				<SkeletonMobileNft />
				<SkeletonMobileNft />
				<SkeletonMobileNft />
				<SkeletonMobileNft />
				<SkeletonMobileNft />
				<SkeletonMobileNft />
			</div>
		</div>
	</>
);
