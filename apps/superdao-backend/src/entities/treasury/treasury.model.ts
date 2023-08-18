import { Field, ObjectType } from '@nestjs/graphql';
import { Dao } from 'src/entities/dao/dao.model';
import { Wallet } from 'src/entities/wallet/wallet.model';
import { NftInfo } from 'src/entities/walletNfts/walletNfts.model';
import { TokenBalance } from '../wallet/dto/tokenBalance.dto';

@ObjectType()
export class Treasury {
	@Field((_type) => Dao)
	dao: Dao;

	@Field((_type) => [Wallet])
	wallets: Wallet[];

	@Field(() => [NftInfo])
	nfts: NftInfo[];

	@Field(() => [TokenBalance])
	assets: TokenBalance[];
}
