import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, ILike, Repository } from 'typeorm';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import isUUID from 'validator/lib/isUUID';

import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { NotFoundError, ValidationError } from 'src/exceptions';
import { GNOSIS_ADMIN_ADDRESS } from 'src/constants';
import { config } from 'src/config';
import { PaginationWithSort } from 'src/gql/pagination';

// utils
import { isForbiddenDaoSlug } from 'src/utils/forbiddenSlugs';
import { validateFile, validateWhitelistUrl } from 'src/utils/upload';

// services
import { EthersService } from 'src/services/ethers/ethers.service';

// entities
import { User } from 'src/entities/user/user.model';
import { Dao } from 'src/entities/dao/dao.model';
import { TreasuryWalletType, Wallet } from 'src/entities/wallet/wallet.model';
import { WalletService } from 'src/entities/wallet/wallet.service';
import { defaultTreasuryMainWalletMeta } from 'src/entities/wallet/constants';
import { CreateDaoInput } from 'src/entities/dao/dto/createDao.dto';
import { DAO_PER_DAY_CREATION, getDefaultClaimDao } from 'src/entities/dao/constants';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { CreateDaoMessage, CreateDaoMessageData } from 'src/entities/blockchain/types';
import { ProposalService } from 'src/entities/proposal/proposal.service';
import { PostService } from 'src/entities/post/post.service';
import { ContractService } from 'src/entities/contract/contract.service';
import { AllDaosFilter } from 'src/entities/dao/allDaosFilter.dto';
import { CompositeBlockchainService } from 'src/services/blockchain/blockchain.service';
import { normalizeSearchQuery } from 'src/utils/normalizeSearchQuery';
import { TreasuryService } from '../treasury/treasury.service';
import { CollectionsService } from '../collections/collections.service';
import { ChainId, SLUG_MIN_LENGTH } from '@sd/superdao-shared';

import { Links } from '../links/links.model';
import { CacheService, getIsDaoVerifiedKey } from 'src/services/cache';

const {
	values: { daoMaxLimit }
} = config;

@Injectable()
export class DaoService {
	private readonly logger = new Logger(DaoService.name);

	constructor(
		@InjectDataSource() private dataSource: DataSource,
		@InjectRedis() private readonly redis: Redis,
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		@InjectRepository(Links) private readonly linksRepository: Repository<Links>,
		@Inject(forwardRef(() => DaoMembershipService)) private daoMembershipService: DaoMembershipService,
		@Inject(forwardRef(() => WalletService)) private walletService: WalletService,
		@Inject(forwardRef(() => ContractService)) private readonly contractService: ContractService,
		@Inject(forwardRef(() => ProposalService)) private readonly proposalService: ProposalService,
		@Inject(forwardRef(() => PostService)) private readonly postService: PostService,
		@Inject(forwardRef(() => TreasuryService)) private readonly treasuryService: TreasuryService,
		@Inject(forwardRef(() => CollectionsService)) private readonly collectionsService: CollectionsService,
		private readonly compositeBlockchainService: CompositeBlockchainService,
		private readonly ethersService: EthersService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly cacheService: CacheService
	) {}

	async getIsDaoVerified(daoId: string) {
		const data = await this.cacheService.getAndUpdate(getIsDaoVerifiedKey(daoId), async () => {
			try {
				const treasuryMainWallet = await this.treasuryService.getTreasuryMainWalletAddress(daoId);
				if (!treasuryMainWallet) return JSON.stringify(false);

				const collection = await this.collectionsService.getCollection(config.verification.daoAddress);
				if (!collection?.tiers) return JSON.stringify(false);

				const owners = await Promise.all(
					collection.tiers.map(async (tier) => {
						const collectionTierData = await this.collectionsService.getCollectionInfoByTier(
							config.verification.daoAddress,
							tier.id
						);

						return Object.keys(collectionTierData.value.owners);
					})
				);

				return JSON.stringify(uniq(flatten(owners)).includes(treasuryMainWallet.toLowerCase()));
			} catch (e) {
				this.logger.error('getIsDaoVerified', { daoId, e });

				return JSON.stringify(false);
			}
		});

		return (data ? JSON.parse(data) : !!data) as Boolean;
	}

	async createDao(createDaoData: CreateDaoInput, userId: string, transactionHash?: string) {
		const { slug, cover, avatar, whitelistUrl } = createDaoData;

		const user = await this.usersRepository.findOneBy({ id: userId });

		if (isForbiddenDaoSlug(slug)) {
			throw new ValidationError('Dao slug is invalid');
		}

		const isCoverValid = cover ? await validateFile(cover) : true;
		const isAvatarValid = avatar ? await validateFile(avatar) : true;
		if (!isCoverValid || !isAvatarValid) {
			throw new ValidationError('File ids are not valid');
		}

		const isWhitelistUrlValid = whitelistUrl ? validateWhitelistUrl(whitelistUrl) : true;
		if (!isWhitelistUrlValid) throw new ValidationError('whitelist url is incorrect');

		const daoCount = Number(await this.redis.get(DAO_PER_DAY_CREATION));
		if (daoCount > daoMaxLimit) throw new ValidationError('DAO creation limit');
		await this.redis.set(DAO_PER_DAY_CREATION, daoCount + 1);

		const dao = await this.daoRepository
			.create({
				...createDaoData,
				isVotingEnabled: true,
				hasDemoProposals: true
			})
			.save();
		await this.daoMembershipService.addMember(dao.id, user!.id, DaoMemberRole.Creator);

		const links = await this.linksRepository
			.create({
				entityId: dao.id,
				site: createDaoData.site,
				twitter: createDaoData.twitter,
				instagram: createDaoData.instagram,
				discord: createDaoData.discord,
				telegram: createDaoData.telegram
			})
			.save();

		dao.links = links;

		await dao.save();

		await this.postService.createDefaultPosts(dao.id);
		await this.proposalService.createDemoProposals(dao);

		if (transactionHash) {
			await this.sendCreateDaoMessage(dao, transactionHash);
		}

		return dao;
	}

	async createDaoContractSuccess(data: CreateDaoMessageData) {
		const { daoId, transactionHash } = data;

		this.logger.log('Transaction for DAO contract finished', { daoId, transactionHash });

		const dao = await this.daoRepository.findOneBy({ id: daoId });
		if (!dao) {
			this.logger.error('DAO is not exist. Failed to add contract address');
			return;
		}

		this.logger.log('getDaoContractAddress', { transactionHash });
		const contractAddress = await this.compositeBlockchainService.getDeployedByTxDaoAddress(transactionHash);
		if (!contractAddress) {
			this.logger.error('DAO contract is not exist. Failed to add contract address');
			return;
		}

		this.logger.log('New DAO contract address: ', { daoAddress: contractAddress });
		dao.contractAddress = contractAddress;

		try {
			const treasuryWalletAddress = await this.contractService.getTreasuryWallet(contractAddress);
			if (!treasuryWalletAddress) throw new NotFoundError('Treasury wallet is not found');

			await this.walletService.createWallet({
				...defaultTreasuryMainWalletMeta,
				daoId,
				address: treasuryWalletAddress,
				type: TreasuryWalletType.SAFE,
				chainId: ChainId.POLYGON_MAINNET
			});
			this.logger.log(`Successfully added main treasury wallet to DAO treasury`, { daoId, treasuryWalletAddress });
		} catch (error) {
			this.logger.error(`Can't add main treasury wallet to to DAO treasury`, { daoId });
		}

		await dao.save();
	}

	createDaoContractFailed(data: CreateDaoMessageData) {
		this.logger.error('createDaoContractFailed', { daoId: data.daoId, hash: data.transactionHash });
	}

	async getTxDeployDefaultDao(walletAddress: string) {
		const createDaoTx = await this.compositeBlockchainService.getDeployDefaultDaoTx(
			[walletAddress, GNOSIS_ADMIN_ADDRESS],
			walletAddress,
			walletAddress
		);

		return createDaoTx;
	}

	async createDefaultDaoDb(userId: string) {
		const timestamp = new Date().getTime();
		const slug = `my-dao_${timestamp}`;
		const createdDao = await this.daoRepository.create(getDefaultClaimDao(slug)).save();

		const links = await this.linksRepository
			.create({
				entityId: createdDao.id
			})
			.save();

		createdDao.links = links;

		await createdDao.save();

		await this.daoMembershipService.addMember(createdDao.id, userId, DaoMemberRole.Creator);

		return createdDao;
	}

	async createDefaultDao(userId: string, nonce?: number) {
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user) throw new NotFoundError();
		const { walletAddress } = user;

		const createDaoTx = await this.getTxDeployDefaultDao(walletAddress);
		const createDaoTxResponse = await this.ethersService.sendTransaction(createDaoTx, nonce);
		const transactionHash = createDaoTxResponse.hash;

		this.logger.log('createDaoTx', { createDaoHash: transactionHash });

		const createdDao = await this.createDefaultDaoDb(userId);

		return {
			createdDao,
			transactionHash
		};
	}

	async sendCreateDaoMessage(createdDao: Dao, transactionHash: string) {
		const createDaoMessage: CreateDaoMessage['data'] = {
			transactionHash,
			daoId: createdDao.id
		};

		await this.transactionBrokerService.trackCreateDaoTransaction(createDaoMessage);
	}

	async configureDefaultDao(dao: Dao) {
		await this.postService.createDefaultPosts(dao.id);
		await this.proposalService.createDemoProposals(dao);
	}

	async getDaosWithSlugShorterThan(length: number) {
		const daosWithShortSlugQueryBuilder = this.daoRepository.createQueryBuilder('daos');

		daosWithShortSlugQueryBuilder.where('LENGTH(daos.slug) < :length', { length });

		return daosWithShortSlugQueryBuilder.getMany();
	}

	/**
	 * update all daos in DB with short slug by adding them access to use it
	 */
	async updateDaosWithShortSlugs() {
		const daos = await this.getDaosWithSlugShorterThan(SLUG_MIN_LENGTH);

		await Promise.all(
			daos.map(async (dao) => {
				dao.hasShortSlugAccess = true;
				await dao.save();
			})
		);
	}

	async getById(id: string) {
		// to handle non-uuid input and sql injections
		try {
			if (!isUUID(id)) return null;

			const dao = await this.daoRepository.findOneBy({ id });

			return dao;
		} catch (e) {
			return null;
		}
	}

	getByAddress(daoAddress: string) {
		return this.dataSource.manager.findOneBy(Dao, {
			contractAddress: ILike(daoAddress)
		});
	}

	getBySlug(slug: string) {
		return this.daoRepository
			.createQueryBuilder('dao')
			.where('LOWER("slug") = LOWER(:slug)', { slug })
			.leftJoinAndSelect('dao.links', 'links')
			.getOne();
	}

	getByIdWithWallets(id: string) {
		return this.daoRepository.findOne({ where: { id }, relations: ['wallets'] });
	}

	async getWinterFiatCheckoutProjectId(daoAddress: string) {
		const dao = await this.getByAddress(daoAddress);

		if (!dao || !dao.winterFiatCheckoutProjectId) return null;

		return dao.winterFiatCheckoutProjectId;
	}

	async checkSlug(slug: string) {
		if (!slug) {
			return { isAvailable: true, nextAvailable: slug };
		}

		let isSlugForbidden = false;

		if (isForbiddenDaoSlug(slug)) {
			/*
				'nextAvailable' slug should be always returned, so we continue the flow here.
				This string manipulation is used not to skip the db check.
			*/
			slug = slug + '1';
			isSlugForbidden = true;
		}

		const regex = new RegExp(`^${slug}(\\d+)?$`);

		const sameSlugCount = await this.daoRepository
			.createQueryBuilder('dao')
			.where('LOWER("slug") ~ LOWER(:slug)', { slug: regex.toString().slice(1, -1) })
			.getCount();

		const isAvailable = !isSlugForbidden && sameSlugCount < 1;
		// FIXME: will break on cases when there are such sets in the database:
		// - ['superdao', 'superdao2']
		// - ['superdao1', 'superdao2']
		// - ['superdao123']
		const nextAvailable = isAvailable ? slug : `${slug}${sameSlugCount}`;

		return { isAvailable, nextAvailable };
	}

	async getAllWithContractAddress() {
		return this.daoRepository.createQueryBuilder('dao').where('dao.contractAddress IS NOT NULL').getMany();
	}

	async getAll(request: PaginationWithSort, filter: AllDaosFilter) {
		const { offset = 0, limit = 20, search = '' } = request;

		const queryBuilder = this.daoRepository.createQueryBuilder('dao');

		queryBuilder.offset(offset);
		queryBuilder.limit(limit);

		const nonNilFilters = omitBy(filter, isNil);
		queryBuilder.where(nonNilFilters);

		const normalizedSearch = normalizeSearchQuery(search);

		if (normalizedSearch) {
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where('dao.name ilike :nameSearch', { nameSearch: `%${normalizedSearch}%` }).orWhere(
						'dao.description ilike :descriptionSearch',
						{ descriptionSearch: `%${normalizedSearch}%` }
					);
				})
			);
		}

		queryBuilder.leftJoin('dao.daoMembership', 'daoMembership');
		queryBuilder.leftJoinAndSelect('dao.links', 'links');

		queryBuilder
			.groupBy('dao.id')
			.addGroupBy('dao.name')
			.addGroupBy('dao.description')
			.addGroupBy('dao.slug')
			.addGroupBy('dao.avatar')
			.addGroupBy('dao.links')
			.addGroupBy('links.id');

		queryBuilder.orderBy(`dao.${request.sortProperty}`, request.sortOrder); // TODO add multi order support

		const count = await queryBuilder.getCount();
		const daos = await queryBuilder.getMany();

		return {
			count,
			items: daos
		};
	}

	async getWalletDao(wallet: Wallet) {
		return this.daoRepository
			.createQueryBuilder('dao')
			.select('dao')
			.where('wallet.id = :id', { id: wallet.id })
			.leftJoin('dao.wallets', 'wallet')
			.getOneOrFail();
	}
}
