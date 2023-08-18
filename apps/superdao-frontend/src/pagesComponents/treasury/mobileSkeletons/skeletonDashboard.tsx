import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const MobileSkeletonDashboard = () => (
	<>
		<div className="bg-backgroundSecondary rounded-t-lg px-6 pt-6">
			<SkeletonComponent variant="rectangular" width={160} height={16} className="rounded" />
			<SkeletonComponent variant="rectangular" className="mt-4 rounded" width={85} height={12} />
		</div>
	</>
);
