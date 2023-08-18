import isMatch from 'lodash/isMatch';
import { isAddress } from 'ethers/lib/utils';
import { sanitizeString } from '@sd/superdao-shared';
import { AirdropParticipantType } from 'src/pagesComponents/membersImport/types';

export const parseCsv = <T = Record<string, any>>(csv: string): T[] => {
	const regex = /;|,/;
	const lines: string[] = csv.split('\n');
	const result: T[] = [];
	const headers: string[] = lines[0].split(regex).map((header) => header.trim());

	for (let i = 1; i < lines.length; i++) {
		const obj: T = {} as T;
		const currentLine = lines[i].split(regex);

		if (currentLine.length !== headers.length) throw new Error('Incorrect csv');

		for (let j = 0; j < headers.length; j++) {
			if (headers[j]) {
				// @ts-ignore
				obj[headers[j]] = sanitizeString(currentLine[j] || '');
			}
		}

		result.push(obj);
	}

	return result;
};

export const csvToJson = async <T = {}>(file?: File): Promise<T[]> => {
	return new Promise((resolve, reject) => {
		if (!file) {
			reject();
		}

		const fileReader = new FileReader();

		fileReader.onload = (loadEvent: ProgressEvent<FileReader>) => {
			const csvContent = loadEvent?.target?.result as string;

			// Trim last newline symbol to skip last empty object
			const trimmedContent = csvContent.replace(/\n+$/, '');

			let result: T[] = [];
			try {
				result = parseCsv<T>(trimmedContent);
			} catch (e) {
				reject(e);
			}

			resolve(result);
		};

		fileReader.readAsText(file as Blob);
	});
};

type LookupType = Record<string, AirdropParticipantType & { count: number }>;

export const scanDuplicatedEmails = (participants: AirdropParticipantType[]) => {
	const lookup: LookupType = participants.reduce((a: LookupType, e) => {
		let mailedObj = a[e.email];
		const isEmailsDefined = mailedObj?.email && e?.email;

		if (mailedObj) {
			if (isEmailsDefined && isMatch(mailedObj, e)) {
				mailedObj.count = ++mailedObj.count;
			} else if (
				mailedObj.email &&
				e.email &&
				mailedObj.email === e.email &&
				mailedObj.walletAddress == e.walletAddress
			) {
				mailedObj.count = ++mailedObj.count;
			}
		} else {
			mailedObj = { ...e, count: 1 };
		}
		a[e.email] = mailedObj;
		return a;
	}, {});
	const duplicatedEmails = Object.keys(lookup).map((key) => {
		if (lookup[key].count > 1) return lookup[key].email;
	});
	const result = participants.filter((participant) => duplicatedEmails.includes(participant.email));
	return result;
};

export const scanCorruptedWallets = (participants: AirdropParticipantType[]) =>
	participants.filter((participant) => participant.walletAddress && !isAddress(participant.walletAddress));

export const scanInvalidAddresses = (participants: AirdropParticipantType[]) =>
	participants.filter((participant) => {
		const isWalletAddressWrong = participant.walletAddress && !isAddress(participant.walletAddress);

		return (isWalletAddressWrong || !participant.walletAddress) && !participant.email;
	});
