import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const SkeletonSafes = () => (
	<>
		<div className="flex items-center pl-3">
			<SkeletonComponent className="flex" variant="circular" width={40} height={40} />
			<div className="ml-4">
				<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
				<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
			</div>
		</div>
		<div className="flex items-center pl-3 pt-5">
			<SkeletonComponent className="flex" variant="circular" width={40} height={40} />
			<div className="ml-4">
				<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
				<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
			</div>
		</div>
		<div className="flex items-center pl-3 pt-5">
			<SkeletonComponent className="flex" variant="circular" width={40} height={40} />
			<div className="ml-4">
				<SkeletonComponent variant="rectangular" className="mb-2 rounded" width={100} height={8} />
				<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
			</div>
		</div>
	</>
);
