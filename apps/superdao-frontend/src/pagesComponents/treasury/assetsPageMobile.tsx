import { useNetworksQuery } from 'src/gql/networks.generated';
import { TokenBalance } from 'src/types/types.generated';
import { MobileAssetsPageSkeleton } from 'src/pagesComponents/treasury/mobileSkeletons/mobileAssetsPageSkeleton';
import { MobileAssetRow } from 'src/pagesComponents/treasury/mobileAssetRow';

type Props = {
	list: Partial<TokenBalance>[];
	isLoading?: boolean;
};

const defaultChains = {
	POLYGON: 137,
	MUMBAI: 80001
};

export const AssetsPageMobile = ({ list, isLoading }: Props) => {
	const networks = useNetworksQuery().data?.networks;

	return (
		<>
			{isLoading ? (
				<MobileAssetsPageSkeleton />
			) : (
				<div className="animate-[fadeIn_1s_ease-in]" data-testid={'AssetsList__wrapper'}>
					{list.map(({ token, amount, value }) => {
						const network =
							token?.chainId !== defaultChains.MUMBAI && token?.chainId !== defaultChains.POLYGON
								? networks?.find((chain) => chain.chainId === token?.chainId)?.title
								: undefined;

						return (
							<MobileAssetRow
								key={token?.address}
								balance={amount}
								logo={token?.iconUrl}
								decimals={token?.decimals || 18}
								value={value}
								symbol={token?.symbol}
								name={token?.name}
								network={network}
							/>
						);
					})}
				</div>
			)}
		</>
	);
};
