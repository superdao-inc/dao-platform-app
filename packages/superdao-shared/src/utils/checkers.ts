import { isAddress } from 'ethers/lib/utils';

export const isString = (maybeStr: any): maybeStr is string => {
	return typeof maybeStr === 'string';
};

export const isNotEmptyString = (maybeStr: unknown): maybeStr is string => {
	return isString(maybeStr) && maybeStr.length !== 0;
};

export const isUniqueStringList = (strings: string[]) => {
	return new Set(strings).size === strings.length;
};

export const isENS = (ens: string) => {
	const parts = ens.split('.');
	return parts.length === 2 && parts[1] === 'eth';
};

export const isAddressesList = (strings: string[]) => {
	for (let i = 0; i < strings.length; i += 1) {
		if (!isAddress(strings[i]) && !isENS(strings[i])) {
			return false;
		}
	}

	return true;
};

export const isNotEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
	return value !== null && value !== undefined;
};
