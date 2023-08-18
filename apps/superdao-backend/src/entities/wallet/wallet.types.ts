import { Field, ObjectType, Int } from '@nestjs/graphql';
import { TokenBalance } from 'src/entities/wallet/dto/tokenBalance.dto';
import { WalletTransaction } from '../walletTransaction/models/walletTransaction';

export type WalletBalance = {
	tokensBalance: TokenBalance[];
	value: string;

	/** deprecated Use value (string) */
	valueUsd: number;
};
@ObjectType()
export class WalletTransactionsResponse {
	@Field(() => [WalletTransaction])
	items: WalletTransaction[];

	@Field(() => Int)
	limit: number;

	@Field(() => Int)
	offset: number;
}

@ObjectType()
export class WalletTransactionResponse {
	@Field(() => WalletTransaction)
	tx: WalletTransaction;
}
