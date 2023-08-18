import times from 'lodash/times';

import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { getNftClass } from 'src/pagesComponents/treasury/styles';
const { wrapperClass, squareWrapperClass, artworkViewClass } = getNftClass();

export const MobileSkeletonNfts = () => (
	<>
		<div className="relative mt-4 grid grid-cols-2 gap-4">
			{times(4).map((_, i) => (
				<div className={wrapperClass} key={i}>
					<div className={squareWrapperClass}>
						<SkeletonComponent variant="rectangular" className={`${artworkViewClass} h-full w-full rounded`} />
					</div>
					<div className="auto-rows-auto≥ h-1.25 mt-4 mb-5 gap-1 px-3">
						<SkeletonComponent variant="rectangular" className="mb-3 rounded" width={48} height={6} />
						<SkeletonComponent variant="rectangular" className="rounded" width={80} height={12} />
					</div>
				</div>
			))}
		</div>
	</>
);
