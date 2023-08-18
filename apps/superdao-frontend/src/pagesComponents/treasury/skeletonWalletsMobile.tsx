import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const SkeletonWalletsBlockMobile = () => {
	return (
		<>
			{Array(3)
				.fill('')
				.map((_, index) => (
					<div key={index} className="mt-[26px] flex justify-between">
						<div className="relative flex flex-col items-start">
							<SkeletonComponent variant="rectangular" className="mb-2 rounded-[3px]" width={80} height={12} />
							<SkeletonComponent variant="rectangular" className="rounded-[3px]" width={48} height={8} />
						</div>
						<div className="flex flex-col items-end">
							<SkeletonComponent variant="rectangular" className="mb-2 rounded-[3px]" width={64} height={12} />
							<SkeletonComponent variant="rectangular" className="rounded-[3px]" width={64} height={8} />
						</div>
					</div>
				))}
		</>
	);
};
