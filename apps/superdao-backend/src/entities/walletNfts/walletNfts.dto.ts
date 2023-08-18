import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';

@ArgsType()
export class GetWalletNftsArgs {
	@Field(() => String)
	walletId: string;

	@Field(() => Int, { nullable: true })
	chainId?: number;
}

@ArgsType()
export class ChangeNftsVisibility {
	@Field(() => [String])
	nftsIds: string[];

	@Field(() => Boolean)
	isPublic: boolean;

	@Field(() => String)
	daoId: string;
}

@InputType('isTierTransferableInput')
export class IsTierTransferable {
	@Field(() => String)
	collectionAddress: string;

	@Field(() => String)
	tierName?: string;

	@Field(() => String)
	id: string;
}

@ArgsType()
export class GetIsTiersTransferable {
	@Field(() => [IsTierTransferable])
	nfts: IsTierTransferable[];
}
