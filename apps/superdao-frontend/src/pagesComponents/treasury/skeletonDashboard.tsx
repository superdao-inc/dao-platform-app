import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const SkeletonDashboard = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 rounded-lg p-6 pb-7">
			<SkeletonComponent variant="rectangular" width={190} height={16} className="rounded" />
			<SkeletonComponent variant="rectangular" className="mt-4 mb-5 rounded" width={96} height={12} />
			<SkeletonComponent variant="rectangular" width={148} height={32} className="rounded-lg" />
		</div>
	</>
);
