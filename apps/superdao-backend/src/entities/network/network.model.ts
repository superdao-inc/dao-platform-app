import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ChainId, CurrencySymbol, EcosystemType } from '@sd/superdao-shared';

registerEnumType(EcosystemType, {
	name: 'EcosystemType',
	description: 'It can be EVM-compatiple system or Solana, Near in the future.'
});

registerEnumType(CurrencySymbol, {
	name: 'CurrencySymbol',
	description: 'Currency short title like ETH or MATIC etc.'
});

registerEnumType(ChainId, {
	name: 'ChainId',
	description: 'For EVM-compatible systems only.'
});

@ObjectType()
export class NetworkEntity {
	@Field(() => EcosystemType)
	ecosystem: EcosystemType;

	@Field(() => Int)
	chainId?: ChainId;

	@Field(() => String)
	title: string;

	@Field(() => String)
	rpcUrl: string;

	@Field(() => String)
	blockExplorerUrl: string;

	@Field(() => CurrencySymbol)
	currencySymbol: CurrencySymbol;

	@Field(() => Boolean)
	isTestNet: boolean;
}
