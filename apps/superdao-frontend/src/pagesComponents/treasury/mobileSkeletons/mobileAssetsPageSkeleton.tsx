import times from 'lodash/times';

import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const MobileAssetsPageSkeleton = () => (
	<>
		<div className="pt-1.5">
			{times(4).map((_, i) => (
				<div key={i} className="relative grid grid-cols-7 items-center rounded-lg pb-4">
					<SkeletonComponent className="col-span-1 flex" variant="circular" width={28} height={28} />
					<div className="col-span-4">
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={80} height={12} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
					<div className="col-span-2">
						<SkeletonComponent variant="rectangular" width={64} height={12} className="ml-auto mb-2 rounded" />
						<SkeletonComponent variant="rectangular" className="ml-auto rounded" width={64} height={8} />
					</div>
				</div>
			))}
		</div>
	</>
);
