import { NftTierAndAmount } from '../../internal/components';
import { NftPrice } from './nftPrice';

import { Title1 } from 'src/components';
import { ArtworkView } from 'src/components/artwork';
import { useCheckoutDataContext } from 'src/features/checkout/internal/context/checkoutDataContext';
import { ChainInfoLabel, DaoInfoLabel, TierTypeInfoLabel } from 'src/pagesComponents/nft/infoLabels';

type Props = {
	discount: number;
};

export const SelectedNFT = (props: Props) => {
	const { discount } = props;

	const { dao, tierInfo } = useCheckoutDataContext();
	const { artworks, id, tierName, maxAmount, totalAmount, collectionName, totalPrice, currency, tierArtworkType } =
		tierInfo;

	const nftPrice = { amount: totalPrice?.openSale || '', currency };

	return (
		<div className="flex grow cursor-pointer flex-wrap rounded-lg md:flex-nowrap">
			<div className="bg-overlaySecondary mb-5 w-full rounded-md md:mb-0 md:mr-4 md:max-w-[240px]">
				<ArtworkView
					className="mx-auto h-full min-h-[296px] w-full rounded-md md:min-h-0"
					artworks={artworks}
					artworksTotalLength={artworks.length}
					sliderProps={{ isSlider: true, className: 'w-full mx-auto' }}
				/>
			</div>
			<div className="flex w-full flex-wrap items-center md:block">
				<div className="order-1 grow">
					<NftTierAndAmount name={tierName || id} totalAmount={totalAmount} maxAmount={maxAmount} />
					<Title1 className="mb-4">{collectionName}</Title1>
				</div>

				<div className="order-3 flex w-full flex-wrap gap-3 md:order-2 md:mb-4">
					<TierTypeInfoLabel tierArtworkType={tierArtworkType} />
					<ChainInfoLabel chain={'polygon'} />
					<DaoInfoLabel {...dao} />
				</div>

				<NftPrice className="order-2 mb-5 w-max md:order-3 md:mb-0" price={nftPrice} discount={discount} />
			</div>
		</div>
	);
};
