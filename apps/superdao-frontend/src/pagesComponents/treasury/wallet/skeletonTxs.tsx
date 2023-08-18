import times from 'lodash/times';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const SkeletonTxsBlock = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 rounded-lg p-6 pb-2">
			<SkeletonComponent variant="rectangular" className="mb-6 rounded" width={120} height={12} />
			<div className="relative grid grid-cols-12 items-center rounded-lg pb-4">
				<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
				<div className="col-span-3">
					<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
					<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
				</div>
				<div className="col-span-5 flex">
					<SkeletonComponent variant="circular" width={24} height={24} />
					<SkeletonComponent variant="rectangular" width={84} height={8} className="my-auto ml-2 rounded" />
				</div>
				<SkeletonComponent variant="rectangular" width={64} height={8} className="col-span-3 ml-auto rounded" />
			</div>
		</div>
	</>
);

export const SkeletonTxs = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 rounded-lg p-6 pb-2">
			{times(3).map((_, i) => (
				<div key={i} className="relative grid grid-cols-12 items-center rounded-lg pb-4">
					<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
					<div className="col-span-3">
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
					<div className="col-span-5 flex">
						<SkeletonComponent variant="circular" width={24} height={24} />
						<SkeletonComponent variant="rectangular" width={84} height={8} className="my-auto ml-2 rounded" />
					</div>
					<SkeletonComponent variant="rectangular" width={64} height={8} className="col-span-3 ml-auto rounded" />
				</div>
			))}
		</div>
	</>
);
