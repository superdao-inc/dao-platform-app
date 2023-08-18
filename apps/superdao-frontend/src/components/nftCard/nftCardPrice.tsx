import { FC } from 'react';
import { Label2 } from 'src/components/text';
import { colors } from 'src/style';

export type NftCardPriceProps = {
	/**
	 * Price with symbol.
	 * @example '0.5 ETH'
	 */
	primaryPrice: string;
	className?: string;
};

export const NftCardPrice: FC<NftCardPriceProps> = (props) => {
	const { primaryPrice, className = '' } = props;

	return (
		<div className={`flex justify-start gap-1 ${className}`}>
			<Label2 color={colors.accentPrimary}>{primaryPrice}</Label2>
		</div>
	);
};
