import { Label2 } from 'src/components';
import { colors } from 'src/style';
import { Erc721Token, Token, WalletTransactionDirection, WalletTransactionPart } from 'src/types/types.generated';
import { shrinkValue } from '@sd/superdao-shared';
import { formatUnitsValue } from 'src/utils/formattes';

type Props = {
	part: WalletTransactionPart;
};

const isERC721Token = (token: Token): token is Erc721Token => token.type === 'ERC-721';

export const TransferPart = ({ part }: Props) => {
	const { token, value, direction } = part;
	if (isERC721Token(token)) {
		return (
			<div className="flex items-center">
				<img className={getAssetImgClass()} src={'/assets/unknown-asset.png'} />
				<Label2>{shrinkValue(token.name, 6, 4, 20)}</Label2>
			</div>
		);
	}

	const sign = direction === WalletTransactionDirection.In ? '+' : '-';
	const color = direction === WalletTransactionDirection.In ? undefined : colors.accentNegative;
	return (
		<div className="flex items-center">
			<img className={getAssetImgClass()} src={token.iconUrl || ''} />
			<Label2 color={color}>
				{`${sign} ${formatUnitsValue(value, token.decimals || 18)}
					${token.symbol}`}
			</Label2>
		</div>
	);
};

const getAssetImgClass = () => 'inline-block mr-2.5 object-cover object-center rounded-full w-6 h-6';
