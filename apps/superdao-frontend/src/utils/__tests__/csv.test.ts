import { describe, test } from '@jest/globals';
import { parseCsv } from '../csv';

describe('CSV utils', () => {
	test('parseCsv() throws if number of headers not equal number of cells', () => {
		expect(() => {
			parseCsv('name,color,weight\napple,green');
		}).toThrow();
	});
});
