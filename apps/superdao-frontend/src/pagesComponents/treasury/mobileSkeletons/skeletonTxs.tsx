import times from 'lodash/times';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const MobileSkeletonTxs = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 rounded-lg px-6 pt-6">
			<SkeletonComponent variant="rectangular" className="mb-6 rounded" width={160} height={16} />
			{times(4).map((_, i) => (
				<div key={i} className="flex justify-between pb-6">
					<div>
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={80} height={12} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
					<div>
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={64} height={12} />
						<SkeletonComponent variant="rectangular" className="rounded" width={64} height={8} />
					</div>
				</div>
			))}
		</div>
	</>
);
