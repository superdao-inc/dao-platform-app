import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const NftEditSkeleton = () => (
	<div className="flex flex-col gap-2">
		<SkeletonComponent variant="rectangular" height={40} className="rounded" />
		<SkeletonComponent variant="rectangular" height={40} className="rounded" />
		<SkeletonComponent variant="rectangular" height={40} className="rounded" />
		<SkeletonComponent variant="rectangular" height={40} className="rounded" />
		<SkeletonComponent variant="rectangular" height={40} className="rounded" />
	</div>
);
