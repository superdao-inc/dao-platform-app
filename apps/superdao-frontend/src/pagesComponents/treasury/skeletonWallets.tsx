import times from 'lodash/times';
import cn from 'classnames';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

export const SkeletonWalletsBlock = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 mt-5 rounded-lg p-6 pb-6">
			<SkeletonComponent variant="rectangular" className="mb-6 rounded" width={100} height={12} />
			<div className="relative grid grid-cols-12 items-center rounded-lg">
				<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
				<div className="col-span-9">
					<SkeletonComponent variant="rectangular" className="mb-3 rounded" width={100} height={8} />
					<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
				</div>
				<SkeletonComponent variant="rectangular" className="col-span-2 ml-auto rounded" width={100} height={24} />
			</div>
			<div className="mt-2 flex pl-[53px]">
				<SkeletonComponent className={borderStyles} variant="circular" width={22} height={22} />
				<SkeletonComponent className={cn(borderStyles, 'ml-[-10px]')} variant="circular" width={22} height={22} />
				<SkeletonComponent className={cn(borderStyles, 'ml-[-10px]')} variant="circular" width={22} height={22} />
			</div>
		</div>
	</>
);

export const SkeletonWallets = () => (
	<>
		<div className="bg-backgroundSecondary rounded-lg p-6 pb-3">
			{times(2).map((_, i) => (
				<div key={i} className="relative mb-3 grid grid-cols-12 items-center rounded-lg">
					<SkeletonComponent className="col-span-1 flex" variant="circular" width={40} height={40} />
					<div className="col-span-9">
						<SkeletonComponent variant="rectangular" className="mb-3 rounded" width={100} height={8} />
						<SkeletonComponent variant="rectangular" className="rounded" width={48} height={8} />
					</div>
					<SkeletonComponent variant="rectangular" className="col-span-2 ml-auto rounded" width={100} height={24} />
				</div>
			))}
		</div>
	</>
);

const borderStyles = 'border-backgroundSecondary border-2 border-solid';
