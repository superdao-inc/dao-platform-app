import { Children, FC, ReactNode } from 'react';
import { ArtworkView } from 'src/components';
import { NftMetadata } from 'src/types/types.generated';

type Props = {
	artworks?: NftMetadata[];
	artworksTotalLength?: number;
	children: ReactNode;
	onMoreArtworks?: () => void;
};

const sliderProps = {
	isSlider: true,
	className: 'min-h-[360px] sm:min-h-[500px]',
	isFullHeightControls: false,
	size: 'md' as const
};

export const DetailsLayout: FC<Props> = ({ children, artworks, artworksTotalLength, onMoreArtworks }) => {
	const arrayChildren = Children.toArray(children);

	return (
		<div className="sm:bg-backgroundSecondary bg-backgroundSecondary relative mb-4 mt-0 min-h-[360px] w-full items-start justify-between overflow-hidden rounded-lg p-4 sm:mb-10 sm:mb-5 sm:mt-4 sm:grid sm:min-h-[500px] sm:grid-cols-[1fr_260px] sm:rounded-none sm:rounded-lg sm:p-0">
			<div className="bg-backgroundTertiary relative h-full min-h-[360px] overflow-hidden sm:min-h-[500px]">
				<ArtworkView
					isZoomEnabled
					playOnHover={false}
					maxArtworksNum={3}
					className="bg-backgroundTertiary sm:max-h-auto h-full max-h-[360px] min-h-[360px] w-full overflow-hidden sm:min-h-[500px]"
					artworks={artworks || []}
					artworksTotalLength={artworksTotalLength}
					size="md"
					onMore={onMoreArtworks}
					sliderProps={sliderProps}
				/>
			</div>
			<div className="flex h-full flex-1 flex-col justify-between py-0 px-0 pt-4 sm:py-6 sm:px-4">
				{Children.map(arrayChildren, (child) => (
					<div>{child}</div>
				))}
			</div>
		</div>
	);
};
