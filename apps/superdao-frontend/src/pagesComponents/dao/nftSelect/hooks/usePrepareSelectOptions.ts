import { useMemo } from 'react';
import { TFunction, useTranslation } from 'next-i18next';
import { SelectNftProps } from '../types';

type OptionItem<T> = { [key: string]: boolean | number | string | undefined | null | object } & T;

type Props<T> = {
	options: OptionItem<T>[];
	optionsMapper: ({ t }: { t: TFunction }) => (item: T) => SelectNftProps;
	beforeOption?: OptionItem<T>;
};

export const usePrepareSelectTiersOption = <T>({
	options,
	beforeOption,
	optionsMapper
}: Props<T>): SelectNftProps[] => {
	const { t } = useTranslation();
	const computed = useMemo(() => {
		const mappedOption = (beforeOption && [optionsMapper({ t })(beforeOption)]) || [];

		return mappedOption.concat(options.map(optionsMapper({ t })));
	}, [beforeOption, options, t, optionsMapper]);

	return computed;
};
