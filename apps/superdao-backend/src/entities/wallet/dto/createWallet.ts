import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsAddress } from 'src/decorators/address.decorator';
import { TreasuryWalletType } from 'src/entities/wallet/wallet.model';
import { sanitizeStringTransform, sanitizeAddressTransform } from '@sd/superdao-shared';

@InputType()
export class CreateWalletInput {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => String)
	@Transform(sanitizeStringTransform)
	name: string;

	@Field(() => String)
	@Transform(sanitizeStringTransform)
	description?: string;

	@Field(() => String)
	@IsAddress()
	@Transform(sanitizeAddressTransform)
	address: string;

	@Field(() => TreasuryWalletType)
	type: TreasuryWalletType;
}
