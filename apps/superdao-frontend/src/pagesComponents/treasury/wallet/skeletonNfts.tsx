import cn from 'classnames';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { flexWrapper, getNftClass } from '../styles';

const { wrapperClass, squareWrapperClass, artworkViewClass } = getNftClass();

export const SkeletonNftsBlock = () => (
	<>
		<div className="bg-backgroundSecondary mb-5 flex flex-col rounded-lg px-6 py-5">
			<div className={cn('flex-col gap-0 pb-0', flexWrapper)}>
				<div className="flex gap-2">
					<SkeletonComponent variant="rectangular" className="mb-6 rounded" width={100} height={12} />
				</div>
			</div>
			<div className="relative grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
				{[0, 1, 2].map((x) => (
					<div className={wrapperClass} key={x}>
						<div className={squareWrapperClass}>
							<SkeletonComponent variant="rectangular" className={`${artworkViewClass} h-full w-full rounded`} />
						</div>
						<div className="auto-rows-auto≥ h-1.25 mt-3 mb-2 gap-1">
							<SkeletonComponent variant="rectangular" className="mb-3 rounded" width={80} height={6} />
							<SkeletonComponent variant="rectangular" className="rounded" width={112} height={8} />
						</div>
					</div>
				))}
			</div>
		</div>
	</>
);

export const SkeletonNfts = () => (
	<>
		<div className="mb-5 flex flex-col rounded-lg">
			<div className="relative grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
				{[0, 1, 2].map((x) => (
					<div className={`${wrapperClass} 'p-4'`} key={x}>
						<div className={squareWrapperClass}>
							<SkeletonComponent variant="rectangular" className="h-full w-full rounded" />
						</div>
						<div className="auto-rows-auto≥ h-1.25 mt-3 mb-2 gap-1">
							<SkeletonComponent variant="rectangular" className="mb-3 rounded" width={80} height={6} />
							<SkeletonComponent variant="rectangular" className="rounded" width={112} height={8} />
						</div>
					</div>
				))}
			</div>
		</div>
	</>
);

export const SkeletonMobileNft = () => (
	<div className={wrapperClass}>
		<div className={squareWrapperClass}>
			<SkeletonComponent variant="rectangular" className="h-full w-full rounded" />
		</div>
		<div className="auto-rows-auto gap-1 p-4">
			<SkeletonComponent variant="rectangular" className="mb-3 rounded" width={80} height={6} />
			<SkeletonComponent variant="rectangular" className="rounded" width={112} height={8} />
		</div>
	</div>
);
