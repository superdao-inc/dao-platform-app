import times from 'lodash/times';

import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const MobileTxsPageSkeleton = () => (
	<>
		<SkeletonComponent variant="rectangular" className="mb-6 mt-1.5 rounded" width={80} height={16} />
		{times(4).map((_, i) => (
			<div key={i} className="flex justify-between pb-6">
				<div className="flex gap-3">
					<SkeletonComponent variant="circular" width={28} height={28} />
					<div>
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={80} height={12} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
				</div>
				<div>
					<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={64} height={12} />
					<SkeletonComponent variant="rectangular" className="rounded" width={64} height={8} />
				</div>
			</div>
		))}
	</>
);
