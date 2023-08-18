import { CompositeBlockchainService } from 'src/services/blockchain/blockchain.service';
import { isAddress } from 'ethers/lib/utils';
import toCamelCase from 'camelcase-keys';

// entities
import { ApolloError } from 'apollo-server';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import Safe from '@gnosis.pm/safe-core-sdk';
import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types';
import { ForbiddenError, NotFoundError } from 'src/exceptions';
import { User } from 'src/entities/user/user.model';
import { UserService } from 'src/entities/user/user.service';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { Dao } from 'src/entities/dao/dao.model';
import { DaoService } from 'src/entities/dao/dao.service';
import { CollectionTierInfo, EnrichedNftOwner, EnrichedNftWithCollectionAddress } from 'src/entities/nft/nft.types';
import { WhitelistService } from 'src/entities/whitelist/whitelist.service';

// services
import { ClaimNftMessage, MessageData } from 'src/entities/blockchain/types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { EmailVerificationService } from 'src/services/emailVerification/emailVerification.service';
import { EthersService } from 'src/services/ethers/ethers.service';
import { Collection } from 'src/blockchain/collection';
import { EmailService } from 'src/services/email/email.service';
import { NftClientService } from 'src/entities/nft/nft-client.service';
import { SocketService } from 'src/services/socket/socket.service';
import { GNOSIS_ADMIN_ADDRESS } from 'src/constants';
import { CacheService, getCollectionsKey, getCollectionTierKey, getUserNftsKey } from 'src/services/cache';
import { config } from 'src/config';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { ClaimNftSuccessMessageBody, Cover, MessageName } from '@sd/superdao-shared';
import { CollectionsService } from '../collections/collections.service';
import { ContractService } from '../contract/contract.service';

// utils
// constants
import { updateArtwork } from '../blockchain/mappers';
import { WhitelistStatusEnum } from '../whitelist/whitelist.types';
import { TransactionsLoggingService } from '../logging/logging.service';
import { EmailSettingsService } from '../emailSettings/emailSettings.service';

@Injectable()
export class NftService {
	private readonly logger = new Logger(NftService.name);

	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		private readonly cacheService: CacheService,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly nftClientService: NftClientService,
		private readonly userService: UserService,
		private readonly socketService: SocketService,
		private readonly whitelistService: WhitelistService,
		private readonly collectionsService: CollectionsService,
		private readonly contractService: ContractService,
		private readonly emailService: EmailService,
		private readonly emailSettingsService: EmailSettingsService,
		private readonly emailVerificationService: EmailVerificationService,
		private readonly ethersService: EthersService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly transactionsLoggingService: TransactionsLoggingService,
		private readonly compositeBlockchainService: CompositeBlockchainService
	) {}

	async getUserNfts(userId: string): Promise<EnrichedNftOwner[]> {
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user) throw new NotFoundError();

		const daos = await this.daoMembershipService.getParticipations(userId);
		if (!daos) throw new NotFoundError();

		const daoAddresses: string[] = daos.items.map((m) => m.contractAddress).filter(isAddress);
		if (!daoAddresses.length) return [];

		const promises: Promise<void>[] = [];
		const nftsWithDao: EnrichedNftOwner[] = [];

		for (let i = 0; i < daoAddresses.length; i += 1) {
			const daoAddress = daoAddresses[i];
			const dao = await this.daoService.getByAddress(daoAddress);
			if (!dao?.contractAddress) continue;

			const getNfts = async () => {
				try {
					const nfts = await this.nftClientService.getNftsByUser(daoAddress, user.walletAddress, user);
					for (const nft of nfts) {
						/**
						 * From blockchain we wait traitType, but get trait_type
						 */
						const attributes = nft.metadata?.attributes?.map((attrs) => toCamelCase(attrs));

						let newNft = { ...nft };

						if (nft?.metadata?.attributes) {
							const metadata = {
								...nft?.metadata,
								attributes: attributes!
							};

							newNft = {
								...newNft,
								metadata
							};
						}

						nftsWithDao.push({
							...newNft,
							dao: dao!
						});
					}
				} catch (e) {
					this.logger.error('getUserNfts', { daoAddress, userId, error: e });
				}
			};

			promises.push(getNfts());
		}
		await Promise.all(promises);

		return nftsWithDao;
	}

	async getUserNftsByDao(userId: string, daoAddress: string): Promise<EnrichedNftOwner[]> {
		const user = await this.usersRepository.findOneBy({ id: userId });

		if (!user) throw new NotFoundError();

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });

		if (!dao) throw new NotFoundError();

		const nfts = [];
		try {
			const nftsByUser = await this.nftClientService.getNftsByUser(daoAddress, user.walletAddress, user);
			for (const nft of nftsByUser) {
				/**
				 * From blockchain we wait traitType, but get trait_type
				 */
				const attributes = nft.metadata?.attributes?.map((attrs) => toCamelCase(attrs));

				let newNft = { ...nft };

				if (nft?.metadata?.attributes) {
					const metadata = {
						...nft?.metadata,
						attributes: attributes!
					};

					newNft = {
						...newNft,
						metadata
					};
				}
				nfts.push({ ...newNft, dao });
			}
		} catch (e) {
			this.logger.error('getUserNftsByDao', { daoAddress, userId, error: e });
		}
		return nfts;
	}

	async getEnrichedNftByTokenId(tokenId: string, daoAddress: string): Promise<EnrichedNftWithCollectionAddress> {
		const singleNft = await this.nftClientService.getSingleNft(tokenId, daoAddress);
		const dao = await this.daoService.getByAddress(daoAddress);

		return {
			...singleNft,
			dao: dao!
		};
	}

	async buyNftSuccessMails(
		data: MessageData['BUY_NFT'] | MessageData['BUY_WHITELIST_NFT'],
		user: User,
		tier: CollectionTierInfo,
		artworkId?: number
	) {
		const { email, daoAddress } = data;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		if (email) {
			const { walletAddress, emailVerified, id, displayName } = user;
			const seed = dao.id ? dao.id.split('').reverse().join() : 'peachpuff';

			void this.emailService.sendBuyNftSuccessMessage([email], {
				daoName: dao.name,
				daoSlug: dao.slug,
				walletAddress,
				daoAvatar: dao.avatar
					? `https://ucarecdn.com/${dao.avatar}/-/preview/-/quality/smart/`
					: Cover.generateCoverGradient(seed),
				hasDaoAvatar: Boolean(dao.avatar),
				tierImg: updateArtwork(tier.artworks[artworkId || 0]).image,
				tierName: tier.tierName || tier.id
			});

			if (!emailVerified) {
				void this.emailVerificationService.sendConfirmationEmail({ userId: id, email, displayName: displayName ?? '' });
			}
		}
	}

	async buyNftSuccess(data: MessageData['BUY_NFT']) {
		const { email, userToNotify, daoId, daoAddress, tier } = data;
		this.logger.log(`[MulticurrencyOpenSale] called buyNftSuccess`, { userToNotify, daoId, daoAddress, tier });

		const user = email
			? await this.emailSettingsService.updateUserEmail(userToNotify, email)
			: await this.userService.findByIdOrSlug(userToNotify);

		this.logger.log(`[MulticurrencyOpenSale] buyNftSuccess: find user`, {
			user,
			userToNotify,
			daoId,
			daoAddress,
			tier
		});
		const [tierResponse, artworksResponse] = await Promise.all([
			(await this.collectionsService.getCollectionInfoByTier(daoAddress, tier)).value,
			await this.compositeBlockchainService.getCollectionArtworks(daoAddress!, tier)
		]);

		const tierData = {
			...tierResponse,
			artworks: artworksResponse.artworks
		};

		if (user) {
			const redisUserNftsKeyFieldData = getUserNftsKey(user.walletAddress, daoAddress);
			const redisCollectionTierKeyFieldData = getCollectionTierKey(daoAddress, tier);

			await this.cacheService.hdel(redisUserNftsKeyFieldData.key, redisUserNftsKeyFieldData.field);
			await this.cacheService.hdel(redisCollectionTierKeyFieldData.key, redisCollectionTierKeyFieldData.field);
			await this.cacheService.del(getCollectionsKey(daoAddress));

			this.logger.log(`[MulticurrencyOpenSale] buyNftSuccess: deleted cache`, {
				user,
				userToNotify,
				daoId,
				daoAddress,
				tier
			});

			await this.daoMembershipService.addMember(daoId, userToNotify, DaoMemberRole.Member, tier);
			this.logger.log(`[MulticurrencyOpenSale] added membership`, { user, userToNotify, daoId, daoAddress, tier });

			try {
				const { artworkId } = await this.userService.getMintedNftMeta(daoAddress, tier, user.walletAddress);

				//@ts-ignore
				await this.buyNftSuccessMails(data, user, tierData, artworkId);
			} catch (error) {
				this.logger.error(`[NFT Open Sale] Error while sending emails`, { error, daoAddress, tier, email });
			}

			this.socketService.sendPrivateMessage(userToNotify, MessageName.BUY_NFT_SUCCESS, {
				daoId,
				daoAddress,
				tier
			});
		}
	}

	async buyNftFail(data: MessageData['BUY_NFT']) {
		const { userToNotify, daoId, daoAddress, tier } = data;
		this.logger.log(`[MulticurrencyOpenSale] called buyNftFail`, { userToNotify, daoId, daoAddress, tier });

		this.socketService.sendPrivateMessage(userToNotify, MessageName.BUY_NFT_FAIL, {
			daoId,
			daoAddress,
			tier
		});
	}

	async buyWhitelistNftSuccess(data: MessageData['BUY_WHITELIST_NFT']) {
		const { email, userToNotify, daoId, daoAddress, tier } = data;

		const user = email
			? await this.emailSettingsService.updateUserEmail(userToNotify, email)
			: await this.userService.findByIdOrSlug(userToNotify);

		const [tierResponse, artworksResponse] = await Promise.all([
			(await this.collectionsService.getCollectionInfoByTier(daoAddress, tier)).value,
			await this.compositeBlockchainService.getCollectionArtworks(daoAddress!, tier)
		]);

		const tierData = {
			...tierResponse,
			artworks: artworksResponse.artworks
		};

		if (user) {
			const redisUserNftsKeyFieldData = getUserNftsKey(user.walletAddress, daoAddress);
			const redisCollectionTierKeyFieldData = getCollectionTierKey(daoAddress, tier);

			await this.cacheService.hdel(redisUserNftsKeyFieldData.key, redisUserNftsKeyFieldData.field);
			await this.cacheService.hdel(redisCollectionTierKeyFieldData.key, redisCollectionTierKeyFieldData.field);
			await this.cacheService.del(getCollectionsKey(daoAddress));

			await this.daoMembershipService.addMember(daoId, userToNotify, DaoMemberRole.Member, tier);

			try {
				const { artworkId } = await this.userService.getMintedNftMeta(daoAddress, tier, user.walletAddress);

				//@ts-ignore
				await this.buyNftSuccessMails(data, user, tierData, artworkId);
			} catch (error) {
				this.logger.error(`[NFT Whitelist Sale] Error while sending emails`, {
					error,
					daoAddress,
					tier,
					email
				});
			}

			this.socketService.sendPrivateMessage(userToNotify, MessageName.BUY_WHITELIST_NFT_SUCCESS, {
				daoId,
				daoAddress,
				tier
			});
		}
	}

	async buyWhitelistNftFail(data: MessageData['BUY_WHITELIST_NFT']) {
		const { userToNotify, daoId, daoAddress, tier } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.BUY_WHITELIST_NFT_FAIL, {
			daoId,
			daoAddress,
			tier
		});
	}

	async getVerifyClaimWhitelist(daoAddress: string, userId: string, tier: string) {
		const user = await this.userService.getUserById(userId);
		if (!user) throw new NotFoundError();

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		return Collection.verifyWalletAddress(daoAddress, user.walletAddress, tier);
	}

	async claimNft(userId: string, daoAddress: string, tier: string): Promise<boolean> {
		let daoId;
		try {
			const user = await this.userService.getUserById(userId);
			if (!user) throw new NotFoundError();
			const { walletAddress } = user;

			const dao = await this.daoService.getByAddress(daoAddress);
			if (!dao) throw new NotFoundError();

			const isInWhitelist = await Collection.verifyWalletAddress(daoAddress, walletAddress, tier);
			if (!isInWhitelist) throw new ForbiddenError('You are not in the whitelist');

			const claims = await Collection.getClaims(daoAddress, walletAddress, tier);
			if (claims > 0) {
				this.socketService.sendPrivateMessage(userId, MessageName.CLAIM_NFT_FAIL_HAS_NFT);
				return false;
			}

			const { createdDao, transactionHash } = await this.daoService.createDefaultDao(userId);
			daoId = createdDao.id;
			this.logger.log('dao created', { userId, daoAddress, tier, daoId });

			const claimTx = await Collection.claimWhitelistTx(daoAddress, walletAddress, tier);
			const claimTxResponse = await this.ethersService.sendTransaction(claimTx);
			this.logger.log('claimTx', { claimHash: claimTxResponse.hash });

			await this.daoService.sendCreateDaoMessage(createdDao, transactionHash);

			const msgData: ClaimNftMessage['data'] = {
				daoIdClaimFrom: dao.id,
				daoNameClaimFrom: dao.name,
				daoSlug: createdDao.slug,
				transactionHash: claimTxResponse.hash,
				userToNotify: userId,
				tier,
				id: userId
			};

			this.transactionBrokerService.trackClaimNftTransaction(msgData, false);

			await this.transactionsLoggingService.logClaimNftTransaction({
				executorId: userId,
				transactionHash,
				daoAddress: dao.contractAddress ?? '',
				tier,
				createdDaoSLug: createdDao.slug,
				isLinkClaim: false
			});

			await this.daoService.configureDefaultDao(createdDao);

			return true;
		} catch (e: any) {
			this.logger.error('NFT Claim failed', { userId, daoAddress, tier, error: e?.message });
			if (daoId) {
				const dao = await this.daoService.getById(daoId);
				if (dao) await this.daoRepository.delete(dao.id);
			}
			throw e;
		}
	}

	async claimNftByEmail(userId: string, uid: string): Promise<boolean> {
		let createdDaoId;
		let tiers;
		let daoAddress;
		let whitelistParticipant;
		let inviterDao;

		try {
			whitelistParticipant = await this.whitelistService.getRecordById(uid);
			if (!whitelistParticipant) throw new NotFoundError();
			if (!whitelistParticipant.email) throw Error('No email presented');
			if (!whitelistParticipant.tiers.length) throw new NotFoundError('No tiers found');

			tiers = whitelistParticipant.tiers;

			const user = await this.userService.getUserById(userId);
			if (!user) throw new NotFoundError();
			const { walletAddress } = user;

			inviterDao = await this.daoService.getById(whitelistParticipant.daoId);
			if (!inviterDao) throw new NotFoundError();
			daoAddress = inviterDao.contractAddress;
			if (!daoAddress) throw new NotFoundError();

			// limit only for internal daos
			if (inviterDao.isInternal) {
				const nfts = await this.nftClientService.getNftsByUser(daoAddress, walletAddress, undefined, true);

				if (nfts?.length) {
					this.socketService.sendPrivateMessage(userId, MessageName.CLAIM_NFT_FAIL_HAS_NFT);
					return false;
				}
			}

			const mintByGnosisTx = await this.mintAndDeployDaoByGnosis(
				daoAddress,
				user.walletAddress,
				whitelistParticipant.tiers[0],
				inviterDao.claimDeployDao
			);
			if (!mintByGnosisTx) {
				throw Error('Email claim error');
			}
			this.logger.log(`Email-link-claim mintByGnosisTx: ${JSON.stringify(mintByGnosisTx)} | uid ${uid}`);

			let createdDao;
			if (inviterDao.claimDeployDao) {
				this.logger.log('Email-link-claim deploy dao:', { dao: inviterDao });

				const providerNonce = await this.ethersService.getSigner().getTransactionCount();
				this.logger.log(`MintByGnosis logs createDefaultDao nonce => ${providerNonce} `);

				const res = await this.daoService.createDefaultDaoDb(userId);
				createdDao = res;
				createdDaoId = createdDao.id;
				this.logger.log('Email-link-claim dao created: ', { userId, daoAddress, tiers, daoId: createdDaoId });

				await this.daoService.configureDefaultDao(createdDao);
			}

			const msgData: ClaimNftMessage['data'] = {
				daoIdClaimFrom: inviterDao.id,
				daoNameClaimFrom: inviterDao.name,
				daoSlug: createdDao?.slug ?? '',
				transactionHash: mintByGnosisTx.hash,
				userToNotify: userId,
				tier: tiers[0],
				id: uid,
				createdDaoId: createdDao?.id,
				deployDao: inviterDao.claimDeployDao
			};

			this.transactionBrokerService.trackClaimNftTransaction(msgData, true);

			await this.transactionsLoggingService.logClaimNftTransaction({
				executorId: userId,
				transactionHash: mintByGnosisTx.hash,
				daoAddress: inviterDao.contractAddress ?? '',
				tier: tiers[0],
				createdDaoSLug: createdDao?.slug ?? '',
				isLinkClaim: true
			});

			if (whitelistParticipant.email) {
				await this.userService.updateEmail(userId, whitelistParticipant.email);
			}

			if (inviterDao.id) {
				await this.daoMembershipService.updateMemberTiersOrInsert({ daoId: inviterDao.id, userId, tiers });
			}

			return true;
		} catch (e: any) {
			this.logger.error('Email-link-claim failed with params: ', { userId, daoAddress, tiers, error: e?.message, uid });

			if (createdDaoId) {
				const dao = await this.daoService.getById(createdDaoId);
				if (dao) await this.daoRepository.delete(dao.id);
			}

			throw new ApolloError(e?.message);
		}
	}

	async mintAndDeployDaoByGnosis(daoAddress: string, walletAddress: string, tier: string, deploy?: boolean) {
		const ethAdapter = new EthersAdapter({
			ethers,
			signer: this.ethersService.getSigner()
		});

		const safeSdk: Safe = await Safe.create({
			ethAdapter,
			safeAddress: GNOSIS_ADMIN_ADDRESS
		});

		const mintTx = await this.contractService.mint(daoAddress, walletAddress, tier);
		const contractERC721 = await this.contractService.getERC721PropertiesAddress(daoAddress);

		const nonce = await safeSdk.getNonce();
		this.logger.log(`MintByGnosis logs nonce =>  ${nonce}`);

		const gnosisTxs: MetaTransactionData[] = [];

		gnosisTxs.push({
			to: contractERC721 || '',
			value: '0',
			data: mintTx.data || '',
			operation: OperationType.Call
		});

		try {
			if (deploy) {
				// do tx with deploy
				const { daoConstructorProxy } = config.polygon;
				const deployDaoTx = await this.daoService.getTxDeployDefaultDao(walletAddress);

				gnosisTxs.push({
					to: daoConstructorProxy,
					data: deployDaoTx.data || '',
					operation: OperationType.Call,
					value: '0'
				});
			}

			const gnosisMintTx = await safeSdk.createTransaction(gnosisTxs, { nonce });
			this.logger.log(`MintByGnosis logs gnosisMintTx =>  ${JSON.stringify(gnosisMintTx)}`);

			await safeSdk.signTransaction(gnosisMintTx);

			const gasPrice = await this.ethersService.getGasPrice();

			const providerNonce = await this.ethersService.getSigner().getTransactionCount();
			this.logger.log(`MintByGnosis logs providerNonce => ${providerNonce} `);

			const txSafe = await safeSdk.executeTransaction(gnosisMintTx, {
				gasPrice: gasPrice.toString(),
				gasLimit: 5_000_000,
				nonce: providerNonce
			});

			this.logger.log(`MintByGnosis logs txSafe =>  ${JSON.stringify(txSafe)}`);

			return txSafe;
		} catch (error) {
			this.logger.log(`MintByGnosis error: ${error}`);
			throw Error(`MintByGnosis error: ${error}`);
		}
	}

	async sendNftSuccessMail(data: MessageData['CLAIM_NFT'], user: User) {
		const { daoNameClaimFrom, daoSlug } = data;
		const { email, walletAddress } = user;
		if (email) {
			this.emailService.sendNftSuccessMessage([email], {
				daoName: daoNameClaimFrom,
				daoSlug,
				walletAddress
			});
		}
	}

	async claimNftSuccess(data: MessageData['LINK_CLAIM_NFT'], sendEmail?: boolean) {
		const { daoIdClaimFrom, userToNotify, daoSlug, tier, id, deployDao, transactionHash, createdDaoId } = data;

		await this.daoMembershipService.addMember(daoIdClaimFrom, userToNotify, DaoMemberRole.Member);

		const dao = await this.daoService.getById(daoIdClaimFrom);
		const user = await this.userService.getUserById(userToNotify);
		if (!user || !dao?.contractAddress) throw new NotFoundError('User or Dao not found.');

		const redisUserNftsKeyFieldData = getUserNftsKey(user.walletAddress, dao.contractAddress);
		const redisCollectionTierKeyFieldData = getCollectionTierKey(dao.contractAddress, tier);

		await this.cacheService.hdel(redisUserNftsKeyFieldData.key, redisUserNftsKeyFieldData.field);
		await this.cacheService.hdel(redisCollectionTierKeyFieldData.key, redisCollectionTierKeyFieldData.field);
		await this.cacheService.del(getCollectionsKey(dao.contractAddress));

		if (sendEmail) {
			await this.sendNftSuccessMail(data, user);
		}

		if (deployDao && createdDaoId) {
			await this.daoService.createDaoContractSuccess({ daoId: createdDaoId, transactionHash });
		}

		//data.userToNotify - этой ID пользователя
		await this.whitelistService.updateRecord(id, {
			status: WhitelistStatusEnum.Used,
			walletAddress: user.walletAddress
		});

		const msgData: ClaimNftSuccessMessageBody = { daoSlug: daoSlug, tier };
		this.socketService.sendPrivateMessage(userToNotify, MessageName.CLAIM_NFT_SUCCESS, msgData);
	}

	async claimNftFail(data: MessageData['CLAIM_NFT']) {
		this.socketService.sendPrivateMessage(data.userToNotify, MessageName.CLAIM_NFT_FAIL);
	}

	async saveClaimWhitelistSuccess(data: MessageData['WHITELIST_CLAIM']) {
		const { whitelist, daoId, daoSlug, daoAddress, userToNotify } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.WHITELIST_SUCCESS, {
			daoId,
			daoSlug,
			daoAddress,
			walletsCount: whitelist.length
		});
	}

	async saveClaimWhitelistFail(data: MessageData['WHITELIST_CLAIM']) {
		const { whitelist, daoId, daoSlug, daoAddress, userToNotify } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.WHITELIST_FAIL, {
			daoId,
			daoSlug,
			daoAddress,
			walletsCount: whitelist.length
		});
	}

	async getCollectionInfoByTier(daoAddress: string, tier: string, user?: User) {
		const response = await this.collectionsService.getCollectionInfoByTier(daoAddress, tier, user).catch((error) => {
			this.logger.error(`[MulticurrencyOpenSale] Can't get collection info by tier`, {
				error,
				daoAddress,
				tier,
				userId: user?.id
			});
		});
		if (!response) throw new NotFoundError('No collection found. Please, check tier name');

		const result = response.value;

		const usersByWallets = await this.userService.findManyByWalletAddresses(Object.keys(result.owners));
		const usersByWalletsMap = new Map(usersByWallets?.map((user) => [user.walletAddress.toLowerCase(), user]));

		const transformOwners = Object.entries(result.owners)?.reduce((curr, [walletAddress, nftInfo]) => {
			const user = usersByWalletsMap.get(walletAddress);

			nftInfo?.forEach((nft) => {
				curr.push({
					...(user ?? {
						id: walletAddress,
						displayName: null,
						email: null,
						avatar: null,
						ens: null,
						walletAddress
					}),
					...nft
				});
			});

			return curr;
		}, [] as CollectionTierInfo['owners']);

		const winterFiatCheckoutProjectId = await this.daoService.getWinterFiatCheckoutProjectId(daoAddress);

		return {
			...result,
			owners: transformOwners,
			winterFiatCheckoutProjectId
		};
	}
}
