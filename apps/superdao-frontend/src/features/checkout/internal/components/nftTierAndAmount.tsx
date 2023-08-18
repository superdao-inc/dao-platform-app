import { useTranslation } from 'next-i18next';

import cn from 'classnames';
import { Caption } from 'src/components';
import { UNLIMITED_MAX_AMOUNT_VALUE } from 'src/constants';

type Props = {
	name: string;
	totalAmount: number;
	maxAmount: number;
	className?: string;
};

export const NftTierAndAmount = ({ name, totalAmount, maxAmount, className }: Props) => {
	const { t } = useTranslation();

	let cardAmount = '';
	const isUnlimited = maxAmount === UNLIMITED_MAX_AMOUNT_VALUE;

	if (isUnlimited) {
		cardAmount = t('parts.unlimitedMaxAmount');
	} else {
		const usedAmount = maxAmount - totalAmount;
		cardAmount = usedAmount ? `${usedAmount} ${t('prepositions.of')} ${maxAmount}` : `${maxAmount}`;
	}

	return (
		<div className={cn(className, 'flex items-center gap-1')}>
			<Caption className="text-foregroundTertiary truncate capitalize">{name}</Caption>
			<div className="bg-foregroundTertiary h-[1px] w-[1px] min-w-max rounded-full" />
			<Caption className="text-foregroundTertiary min-w-max">{cardAmount}</Caption>
		</div>
	);
};
