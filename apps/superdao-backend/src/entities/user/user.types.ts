import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Dao } from '../dao/dao.model';

@ObjectType()
export class UserDaosParticipation {
	@Field(() => Number)
	count: number;

	@Field(() => [Dao], { nullable: true })
	items: Dao[];
}

export enum UserWalletType {
	SMART_WALLET = 'SMART_WALLET',
	METAMASK = 'METAMASK',
	WALLET_CONNECT = 'WALLET_CONNECT',
	MAGIC_LINK = 'MAGIC_LINK'
}
registerEnumType(UserWalletType, {
	name: 'UserWalletType',
	description: 'The type of wallet the user is using'
});
