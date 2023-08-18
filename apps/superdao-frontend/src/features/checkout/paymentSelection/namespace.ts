import { Token } from '@sd/superdao-shared';

export type EnrichedToken = Token & {
	userBalance: number;
	price: number;
};
