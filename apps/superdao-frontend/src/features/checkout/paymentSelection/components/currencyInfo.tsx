import { useTranslation } from 'next-i18next';
import { Label3, Loader } from 'src/components';

type Props = {
	count: number;
	symbol: string;
	isEqualSymbolShown: boolean;
	gasInfo?: GasInfoProps;
};

export const CurrencyInfo = (props: Props) => {
	const { count, symbol, isEqualSymbolShown, gasInfo } = props;
	const shouldShowGas = !!gasInfo;

	return (
		<div className="flex flex-col items-end">
			<Label3 className="text-foregroundSecondary w-max">
				{isEqualSymbolShown && '≈'} {count} {symbol}
			</Label3>
			{shouldShowGas && <GasInfo {...gasInfo} />}
		</div>
	);
};

type GasInfoProps = {
	isLoading: boolean;
	errorMessage: string | null;
	gas?: {
		amount: number | null;
		tokenSymbol: string;
	};
};

const GasInfo = (props: GasInfoProps) => {
	const { isLoading, errorMessage, gas } = props;
	const { t } = useTranslation();
	if (isLoading) {
		return <Loader size="sm" />;
	}

	if (errorMessage) {
		return <Label3 className="text-errorDefault w-max">{errorMessage}</Label3>;
	}

	return (
		<Label3 className="text-foregroundTertiary w-max font-normal">
			{t('pages.checkout.choose.gas')} ≈ {gas?.amount} {gas?.tokenSymbol}
		</Label3>
	);
};
