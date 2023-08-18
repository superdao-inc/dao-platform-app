import { Body, Label1, SubHeading } from 'src/components';
import { colors } from 'src/style';
import { formatUnitsValue, formatUsdValue } from 'src/utils/formattes';
import { getAssetImgClass } from 'src/pagesComponents/treasury/styles';

const emptyImg = '/assets/unknown-asset.png';

type Props = {
	symbol?: string;
	balance?: string;
	logo?: string | null;
	decimals: number;
	value?: string;
	network?: string;
	name?: string;
};

export const MobileAssetRow = ({ balance, logo, decimals, value, symbol, network, name }: Props) => {
	return (
		<div className="relative grid grid-cols-9 items-center rounded-lg pt-3" data-testid={`AssetRow__wrapper${name}`}>
			<Body className="col-span-1 flex" data-testid={'AssetRow__avatar'}>
				<img className={getAssetImgClass(true)} src={logo || emptyImg} />
			</Body>
			<Body className="col-span-4">
				<Label1 data-testid={'AssetRow__name'}>{`${name} (${symbol})`}</Label1>
				<SubHeading color={colors.foregroundSecondary} data-testid={'AssetRow__network'}>
					{network}
				</SubHeading>
			</Body>
			<Body className="col-span-4">
				<Body className="text-right" data-testid={'AssetRow__balance'}>
					{balance && formatUnitsValue(balance, decimals)}
				</Body>
				<Body color={colors.foregroundTertiary} className="text-right" data-testid={'AssetRow__value'}>
					{value ? `≈ $${formatUsdValue(Number(value))}` : '–'}
				</Body>
			</Body>
		</div>
	);
};
