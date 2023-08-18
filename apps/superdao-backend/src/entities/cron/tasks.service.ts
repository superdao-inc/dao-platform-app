import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isAddress } from 'ethers/lib/utils';
import Redis from 'ioredis';
import toLower from 'lodash/toLower';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import map from 'lodash/map';
import { GetWalletTreasuryResponse } from 'src/entities/blockchain/types';
import { UserService } from 'src/entities/user/user.service';
import { ContractService } from 'src/entities/contract/contract.service';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { config } from 'src/config';
import { GNOSIS_ADMIN_ADDRESS } from 'src/constants';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { AlchemyService } from 'src/services/alchemy/alchemy.service';
import { featureToggles } from 'src/services/featureToggles';
import { User } from 'src/entities/user/user.model';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { CovalentApi } from 'src/libs/covalentApi';
import { CompositeBlockchainService } from 'src/services/blockchain/blockchain.service';
import { defaultTreasuryMainWalletMeta } from '../wallet/constants';
import { WalletService } from '../wallet/wallet.service';
import { TreasuryWalletType, Wallet } from '../wallet/wallet.model';
import { DaoService } from '../dao/dao.service';
import { Dao } from '../dao/dao.model';
import { DAO_PER_DAY_CREATION } from '../dao/constants';
import { getAddress, EcosystemType, Chain } from '@sd/superdao-shared';
import { TreasuryService } from '../treasury/treasury.service';

const { isDev } = config.env;

@Injectable()
export class TasksService {
	private readonly logger = new Logger(TasksService.name);

	constructor(
		@InjectRedis() private readonly redis: Redis,
		@InjectRepository(User) private userRepository: Repository<User>,
		@InjectRepository(Dao) private daoRepository: Repository<Dao>,
		private readonly httpService: HttpService,
		private readonly userService: UserService,
		private readonly contractService: ContractService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly daoService: DaoService,
		private readonly walletService: WalletService,
		private readonly alchemyService: AlchemyService,
		private readonly treasuryService: TreasuryService,
		@Inject('COVALENT_API')
		private readonly covalentApi: CovalentApi,
		private readonly compositeBlockchainService: CompositeBlockchainService
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
		timeZone: 'GMT'
	})
	async resetDaoLimits() {
		await this.redis.set(DAO_PER_DAY_CREATION, 0);
	}

	@Cron(CronExpression.EVERY_5_MINUTES)
	async getAdminList() {
		if (isDev) return;
		try {
			const daos = await this.daoService.getAllWithContractAddress();

			const daoAddresses = daos
				?.map((dao) => dao.contractAddress?.toLowerCase())
				.filter((contractAddress) => isAddress(contractAddress!));

			if (!daoAddresses.length) {
				return;
			}

			const admins = await this.compositeBlockchainService.getDaosAdmins(daoAddresses as string[]);

			for (const daoAddress in admins) {
				const item = admins[daoAddress];

				const lowerWalletAddresses = item.map(toLower).filter((i) => i !== GNOSIS_ADMIN_ADDRESS.toLowerCase()); //убираем sudo

				await this.userService.saveAdminFromSmartContract(daoAddress, lowerWalletAddresses);
				await this.daoMembershipService.updateCreatorOrSudo(daoAddress, '', DaoMemberRole.Sudo);
			}
		} catch (error: any) {
			this.logger.error(`getAdminList Error`, {
				message: 'Has error: getAdminList()',
				stack: error.stack
			});
		}
	}

	@Cron(CronExpression.EVERY_30_MINUTES)
	async getCreator() {
		if (isDev) return;
		const daos = await this.daoService.getAllWithContractAddress();

		const daoAddresses = daos
			?.map((dao) => dao.contractAddress)
			.filter((contractAddress) => isAddress(contractAddress!));

		if (!daoAddresses.length) {
			return;
		}

		for (let i = 0; i < daoAddresses.length; i++) {
			const daoAddress = daoAddresses[i];
			let creator: string = '';

			try {
				creator = await this.contractService.getCreator(daoAddress!.toLowerCase());
			} catch (error: any) {
				this.logger.error(`getCreator Error`, {
					message: `Has error: getCreator() in ${daoAddress}`,
					stack: error.stack
				});
			}

			if (creator) {
				await this.daoMembershipService.updateCreatorOrSudo(daoAddress!, creator, DaoMemberRole.Creator);
			}
		}
	}

	@Cron(CronExpression.EVERY_5_MINUTES)
	async getMemberList() {
		if (isDev) return;
		const daos = await this.daoService.getAllWithContractAddress();

		const daoAddresses = daos
			?.map((dao) => dao.contractAddress?.toLowerCase())
			.filter((contractAddress) => isAddress(contractAddress!));

		if (!daoAddresses.length) return;

		let data;
		try {
			data = await this.compositeBlockchainService.getDaosMembers(daoAddresses as string[]);
		} catch (error: any) {
			this.logger.error(`getMemberList Error`, {
				message: `Has error: ${error.message}`,
				stack: error.stack
			});
		}

		if (!data) return;

		for (const daoAddress of daoAddresses) {
			const daoMembers = data[daoAddress!];

			if (!daoMembers?.length) {
				continue;
			}

			try {
				await this.userService.saveMembersFromSmartContract(daoAddress!, daoMembers);
			} catch (error: any) {
				this.logger.error(`saveMembers Error`, {
					message: `daoAddress - ${daoAddress} has error: ${error.message}`,
					stack: error.stack
				});

				break;
			}
		}
	}

	@Cron(CronExpression.EVERY_30_MINUTES)
	async syncDaoWallet() {
		if (isDev) return;
		if (!featureToggles.isEnabled('treasury_main_safe_sync')) return;

		const daoWithContract = await this.daoService.getAllWithContractAddress();
		if (daoWithContract.length === 0) {
			return;
		}
		this.logger.log(`[SyncDaoWallet]: found ${daoWithContract.length} daos with contract.`);

		const updatedWallets = [] as Wallet[];
		const daoMainWallets = new Map<Dao, string>();

		await Promise.all(
			daoWithContract.map(async (dao) => {
				try {
					const response = await this.httpService.axiosRef.get<GetWalletTreasuryResponse>('/treasury/wallet', {
						data: { daoAddress: dao.contractAddress }
					});
					const { result: walletAddress } = response.data;
					if (isAddress(walletAddress) && walletAddress !== '0x0000000000000000000000000000000000000000') {
						daoMainWallets.set(dao, walletAddress);
					}
				} catch (e) {
					this.logger.error(`[SyncDaoWallet]: Error while getting dao's wallet. Dao address=${dao.contractAddress}.`);
				}
			})
		);

		await Promise.all(
			Array.from(daoMainWallets).map(async ([dao, address]) => {
				const treasuryWalletAddress = getAddress(address);
				if (!treasuryWalletAddress) return;

				try {
					const wallets = await this.walletService.getDaoWallets(dao.id);
					const existingWallet = wallets.find((w) => w.address === treasuryWalletAddress);
					const treasuryMainWallet = wallets.find((w) => w.main);

					if (existingWallet) {
						if (!existingWallet.main) {
							existingWallet.main = defaultTreasuryMainWalletMeta.main;
							existingWallet.name = defaultTreasuryMainWalletMeta.name;
							existingWallet.description = defaultTreasuryMainWalletMeta.description;
							updatedWallets.push(await existingWallet.save());
						}
					} else {
						const walletType = await this.alchemyService.getAddressType(treasuryWalletAddress);
						if (!walletType) {
							this.logger.warn(
								`Cannot resolve wallet type. Wallet address: ${treasuryWalletAddress}. Dao slug ${dao.slug}`
							);
							return;
						}
						if (walletType === TreasuryWalletType.EXTERNAL) {
							this.logger.warn(
								`Found external wallet in contract. Wallet address: ${treasuryWalletAddress}. Dao slug ${dao.slug}`
							);
							return;
						}
						const chainId = Chain.Polygon.valueOf();
						if (treasuryMainWallet) {
							treasuryMainWallet.type = TreasuryWalletType.SAFE;
							treasuryMainWallet.chainId = chainId;
							updatedWallets.push(
								await this.walletService.updateMainWalletAddress(treasuryMainWallet, treasuryWalletAddress)
							);
						} else {
							const newWallet = await Wallet.save({
								address: treasuryWalletAddress,
								main: defaultTreasuryMainWalletMeta.main,
								name: defaultTreasuryMainWalletMeta.name,
								description: defaultTreasuryMainWalletMeta.description,
								daoId: dao.id,
								ecosystem: EcosystemType.EVM,
								type: TreasuryWalletType.SAFE,
								chainId: chainId
							});
							await this.walletService.addWalletToWalletAssetsService(newWallet);
							updatedWallets.push(newWallet);
						}
					}
				} catch (e) {
					this.logger.error(`[SyncDaoWallet]: Error while updating dao's wallet. Dao address=${dao.contractAddress}.`);
				}
			})
		);

		this.logger.log(`[SyncDaoWallet]: ${updatedWallets.length} wallets was synced.`);
	}

	@Cron(CronExpression.EVERY_HOUR)
	async updateUserEns() {
		this.logger.log('updateUserEns is running...');

		const take = 1000;
		let skip = 0;
		let users: User[];
		const allEnsEntries: { [key: string]: string } = {};

		do {
			users = await this.userRepository.find({ take, skip, order: { createdAt: 'ASC' }, relations: {} });
			skip += users.length;

			const batchEnsEntries = await EnsResolver.lookupBatch(users.map(({ walletAddress }) => walletAddress));
			Object.assign(allEnsEntries, batchEnsEntries);
		} while (users.length === take);

		const upsertEntities = map(allEnsEntries, (ens, walletAddress) => ({
			walletAddress,
			ens
		}));

		await this.userRepository.upsert(upsertEntities, ['walletAddress']);
		this.logger.log(`ENS updated for ${upsertEntities.length} users`);
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async updateTreasuryUSDValue() {
		if (!featureToggles.isEnabled('treasury_update_treasury_value')) {
			this.logger.log(`updateTreasuryUSDValue: skipping because treasury_update_treasury_value flag is off`);
			return;
		}

		this.logger.log('updateTreasuryUSDValue is running...');

		this.logger.log(`updateTreasuryUSDValue: fetching DAOs`);
		const daos = await this.daoRepository.find();

		const treasuryValueByDaoId: Record<string, number> = {};

		for (const [index, dao] of daos.entries()) {
			try {
				this.logger.log(
					`updateTreasuryUSDValue: [${index + 1}/${daos.length}] fetching treasury value for DAO ${dao.id}`
				);
				const value = await this.treasuryService.getTreasuryValue(dao, this.covalentApi);

				this.logger.log(`updateTreasuryUSDValue: treasury value for DAO ${dao.id} ${dao.name} is ${value}`);
				treasuryValueByDaoId[dao.id] = value;
			} catch (err) {
				this.logger.log(`updateTreasuryUSDValue: failed to fetch treasury value for dao ${dao.id}`, err);
			}
		}

		for (const [index, dao] of daos.entries()) {
			try {
				this.logger.log(
					`updateTreasuryUSDValue: [${index + 1}/${daos.length}] updating treasury value for DAO ${dao.id}`
				);

				const treasuryValue = treasuryValueByDaoId[dao.id] || 0;
				await this.daoRepository.update(dao.id, { treasuryValue: treasuryValue });
			} catch (err) {
				this.logger.log(`updateTreasuryUSDValue: failed to update dao ${dao.id}`, err);
			}
		}

		this.logger.log(`updateTreasuryUSDValue: finished`);
	}
}
