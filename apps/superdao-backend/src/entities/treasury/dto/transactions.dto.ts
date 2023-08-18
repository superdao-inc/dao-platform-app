import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Equals } from 'class-validator';
import { EcosystemType } from '@sd/superdao-shared';
import { PaginationArgs } from 'src/gql/pagination';

@ArgsType()
export class TransactionsArgs extends PaginationArgs {
	@Field(() => String)
	daoId: string;

	@Field(() => Int, { nullable: true })
	chainId?: number;

	@Field(() => EcosystemType, { defaultValue: EcosystemType.EVM })
	@Equals(EcosystemType.EVM)
	ecosystem: EcosystemType;
}
