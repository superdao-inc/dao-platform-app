import times from 'lodash/times';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const SkeletonAssetsBlock = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 rounded-lg p-6 pb-2">
			<SkeletonComponent variant="rectangular" className="mb-6 rounded" width={100} height={12} />
			<div className="mb-4 grid grid-cols-12">
				<SkeletonComponent variant="rectangular" width={44} height={8} className="col-span-4 rounded" />
				<SkeletonComponent variant="rectangular" width={50} height={8} className="col-span-2 ml-auto rounded" />
				<SkeletonComponent variant="rectangular" width={71} height={8} className="col-span-3 ml-auto rounded" />
				<SkeletonComponent variant="rectangular" width={71} height={8} className="col-span-3 ml-auto rounded" />
			</div>
			{times(2).map((_, i) => (
				<div key={i} className="relative grid grid-cols-12 items-center rounded-lg pb-4">
					<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
					<div className="col-span-3">
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
					<SkeletonComponent variant="rectangular" width={84} height={8} className="col-span-2 ml-auto rounded" />
					<SkeletonComponent variant="rectangular" width={100} height={8} className="col-span-3 ml-auto rounded" />
					<SkeletonComponent variant="rectangular" width={100} height={8} className="col-span-3 ml-auto rounded" />
				</div>
			))}
		</div>
	</>
);

export const SkeletonAssets = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 rounded-lg p-6 pb-2">
			<div className="mb-4 grid grid-cols-12">
				<SkeletonComponent variant="rectangular" width={44} height={8} className="col-span-4 rounded" />
				<SkeletonComponent variant="rectangular" width={50} height={8} className="col-span-2 ml-auto rounded" />
				<SkeletonComponent variant="rectangular" width={71} height={8} className="col-span-3 ml-auto rounded" />
				<SkeletonComponent variant="rectangular" width={71} height={8} className="col-span-3 ml-auto rounded" />
			</div>
			<div className="relative grid grid-cols-12 items-center rounded-lg pb-4">
				<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
				<div className="col-span-3">
					<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
					<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
				</div>
				<SkeletonComponent variant="rectangular" width={84} height={8} className="col-span-2 ml-auto rounded" />
				<SkeletonComponent variant="rectangular" width={100} height={8} className="col-span-3 ml-auto rounded" />
				<SkeletonComponent variant="rectangular" width={100} height={8} className="col-span-3 ml-auto rounded" />
			</div>
			{times(2).map((_, i) => (
				<div key={i} className="relative grid grid-cols-12 items-center rounded-lg pb-4">
					<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
					<div className="col-span-3">
						<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
					<SkeletonComponent variant="rectangular" width={84} height={8} className="col-span-2 ml-auto rounded" />
					<SkeletonComponent variant="rectangular" width={100} height={8} className="col-span-3 ml-auto rounded" />
					<SkeletonComponent variant="rectangular" width={100} height={8} className="col-span-3 ml-auto rounded" />
				</div>
			))}
		</div>
	</>
);
