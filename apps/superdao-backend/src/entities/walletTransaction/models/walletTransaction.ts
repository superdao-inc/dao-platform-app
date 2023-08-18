import { ID, Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { EcosystemType } from '@sd/superdao-shared';
import { Token } from 'src/entities/token';

export enum WalletTransactionDirection {
	'IN' = 'IN',
	'OUT' = 'OUT',
	'SELF' = 'SELF'
}
registerEnumType(WalletTransactionDirection, {
	name: 'WalletTransactionDirection'
});

export enum WalletTransactionType {
	'SEND' = 'SEND',
	'RECEIVE' = 'RECEIVE',
	'SELL' = 'SELL',
	'EXECUTION' = 'EXECUTION',
	'SAFE_SETUP' = 'SAFE_SETUP',
	'SEND_NFT' = 'SEND_NFT',
	'RECEIVE_NFT' = 'RECEIVE_NFT'
}
registerEnumType(WalletTransactionType, {
	name: 'WalletTransactionType'
});

export enum WalletTransactionStatus {
	'SUCCESS' = 'SUCCESS',
	'FAILED' = 'FAILED'
}
registerEnumType(WalletTransactionStatus, {
	name: 'WalletTransactionStatus'
});

export enum AccountType {
	'UNKNOWN' = 'UNKNOWN',
	'EXTERNAL' = 'EXTERNAL',
	'CONTRACT' = 'CONTRACT'
}
registerEnumType(AccountType, {
	name: 'AccountType'
});

@ObjectType()
export class Account {
	@Field(() => AccountType)
	type: AccountType;

	@Field(() => String, { nullable: true })
	address: string | null;
}

@ObjectType()
export class WalletTransactionPart {
	@Field(() => Token)
	token: Token;

	@Field(() => String)
	value: string;

	@Field(() => Account)
	from: Account;

	@Field(() => Account)
	to: Account;

	@Field(() => WalletTransactionDirection)
	direction: WalletTransactionDirection;
}

@ObjectType()
export class WalletTransaction {
	@Field(() => ID)
	hash: string;

	@Field(() => EcosystemType)
	ecosystem: EcosystemType;

	@Field(() => Int, { nullable: true })
	chainId: number | null;

	@Field(() => WalletTransactionType)
	type: WalletTransactionType;

	@Field(() => WalletTransactionStatus)
	status: WalletTransactionStatus;

	@Field(() => String)
	executed: string;

	@Field(() => String)
	gasFee: string;

	@Field(() => String, { nullable: true })
	fromAddress: string | null;

	@Field(() => String, { nullable: true })
	toAddress: string | null;

	@Field(() => String, { nullable: true })
	value: string | null;

	@Field(() => String, { nullable: true, description: 'User defined annotation' })
	description: string | null;

	@Field(() => WalletTransactionDirection)
	direction: WalletTransactionDirection;

	@Field(() => [WalletTransactionPart], {
		nullable: true,
		description:
			'Part is separate in/out asset transfer within transaction. One element means simple one-step transfer.'
	})
	parts: WalletTransactionPart[] | null;

	@Field(() => String, { nullable: true })
	walletAddress: string | null;

	@Field(() => String, { nullable: true })
	walletName?: string | null;

	@Field(() => String, { nullable: true })
	walletId?: string | null;
}
