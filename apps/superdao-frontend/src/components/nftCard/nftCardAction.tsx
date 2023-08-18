import React from 'react';

import { NftCardButton } from './nftCardButton';
import { NftCardPrice, NftCardPriceProps } from './nftCardPrice';

type Props = {
	buttonText: string;
	isDisabled?: boolean;
	onClick?: (event: React.MouseEvent) => void;
} & Omit<NftCardPriceProps, 'className'>;

export const NftCardAction = ({ primaryPrice, buttonText, isDisabled, onClick }: Props) => (
	<>
		<NftCardPrice className="mt-1" primaryPrice={primaryPrice} />
		<NftCardButton className="mt-4" content={buttonText} isDisabled={isDisabled} onClick={onClick} />
	</>
);
