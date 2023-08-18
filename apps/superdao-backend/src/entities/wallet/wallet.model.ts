import { BaseEntity, Column, Entity, getRepository, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ChainId, EcosystemType } from '@sd/superdao-shared';
import { WalletOwner } from './dto/walletOwner';
import { TokenBalance } from './dto/tokenBalance.dto';
import { WalletTransaction } from 'src/entities/walletTransaction/models/walletTransaction';
import { NftInfo } from '../walletNfts/walletNfts.model';
import { Dao } from '../dao/dao.model';

export enum TreasuryWalletType {
	EXTERNAL = 'EXTERNAL',
	SAFE = 'SAFE'
}

registerEnumType(TreasuryWalletType, {
	name: 'TreasuryWalletType'
});

@Entity({ name: 'wallets' })
@ObjectType()
export class Wallet extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'varchar', unique: true })
	address: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	name: string;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true, type: 'varchar', default: null })
	description: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@ManyToOne(() => Dao, (dao: Dao) => dao.wallets)
	dao: Dao;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	updatedAt: Date;

	@Field(() => Float) // TODO add FieldResolver for valueUsd in wallet.resolver
	valueUsd: number;

	@Field(() => [TokenBalance])
	tokensBalance?: TokenBalance[]; // TODO add FieldResolver for tokensBalance in wallet.resolver

	@Field(() => TreasuryWalletType)
	@Column({ type: 'enum', enum: TreasuryWalletType, default: TreasuryWalletType.EXTERNAL })
	type: TreasuryWalletType;

	@Field(() => [WalletOwner], { nullable: true }) // TODO add FieldResolver for owners in wallet.resolver
	owners: WalletOwner[] | null;

	@Field(() => [WalletTransaction])
	transactions?: WalletTransaction[];

	@Field(() => EcosystemType)
	@Column({ type: 'enum', enum: EcosystemType, default: EcosystemType.EVM })
	ecosystem: EcosystemType;

	@Field(() => ChainId, { nullable: true })
	@Column({ type: 'enum', enum: ChainId, nullable: true })
	chainId: ChainId | null;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	main: boolean;

	@Field(() => [NftInfo], { nullable: true })
	nfts?: NftInfo[];
}

/**
 * @deprecated Use nest repository injection https://docs.nestjs.com/techniques/database#repository-pattern
 */
export const walletRepository = () => getRepository(Wallet);
