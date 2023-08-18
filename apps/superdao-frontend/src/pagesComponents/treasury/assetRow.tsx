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
	rate?: string | null;
	network?: string;
	name?: string;
};

export const AssetRow = ({ balance, logo, decimals, value, rate, symbol, network, name }: Props) => {
	return (
		<div className="relative grid grid-cols-12 items-center rounded-lg py-3" data-testid={`AssetRow__wrapper${name}`}>
			<Body className="col-span-1 flex" data-testid={'AssetRow__avatar'}>
				<img className={getAssetImgClass(false)} src={logo || emptyImg} />
			</Body>
			<Body className="col-span-4">
				<Label1 data-testid={'AssetRow__name'}>{`${name} (${symbol})`}</Label1>
				<SubHeading color={colors.foregroundSecondary} data-testid={'AssetRow__network'}>
					{network}
				</SubHeading>
			</Body>

			<Body className="col-span-3 text-right" data-testid={'AssetRow__balance'}>
				{balance && formatUnitsValue(balance, decimals)}
			</Body>
			<Body className="col-span-2 text-right" data-testid={'AssetRow__rate'}>
				{rate ? formatUsdValue(Number(rate)) : '–'}
			</Body>
			<Body className="col-span-2 text-right" data-testid={'AssetRow__value'}>
				{value ? formatUsdValue(Number(value)) : '–'}
			</Body>
		</div>
	);
};
