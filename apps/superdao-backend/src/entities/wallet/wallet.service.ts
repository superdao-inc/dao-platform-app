import { BadRequestException, Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BigNumber } from 'bignumber.js';
import flatten from 'lodash/flatten';
import pick from 'lodash/pick';
import find from 'lodash/find';
import concat from 'lodash/concat';
import defaultTo from 'lodash/defaultTo';
import { In, Repository } from 'typeorm';
import { getAddress, chainIds, EcosystemType } from '@sd/superdao-shared';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { WalletOwner } from 'src/entities/wallet/dto/walletOwner';
import { TreasuryWalletType, Wallet } from 'src/entities/wallet/wallet.model';
import { WalletBalance } from 'src/entities/wallet/wallet.types';
import { ForbiddenError, NotFoundError } from 'src/exceptions';
import { CovalentApi } from 'src/libs/covalentApi';
import { featureToggles } from 'src/services/featureToggles';
import { getAllChainSafes, getSafeInfo } from 'src/services/gnosis';
import { NftsProviderService } from 'src/services/nfts-provider/nfts-provider.service';
import { DaoService } from '../dao/dao.service';
import { components } from '../../services/walletAssets/dto.generated';
import { WalletAssetsService } from '../../services/walletAssets/walletAssets.service';
import { CreateWalletDto } from './dto/createWallet.dto';
import { DeleteWalletDto } from './dto/deleteWallet.dto';
import { TokenBalance } from './dto/tokenBalance.dto';
import { TransactionsProviderService } from 'src/services/transactions-provider/transactions-provider.service';
import { normalizeToken } from './utils';
import { DaoMembership } from '../daoMembership/daoMembership.model';
import { UserService } from '../user/user.service';
import { WalletName } from './dto/walletName';

@Injectable()
export class WalletService {
	constructor(
		@InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
		@Inject(forwardRef(() => DaoMembershipService)) private readonly daoMembershipService: DaoMembershipService,
		@Inject(forwardRef(() => WalletAssetsService)) private readonly walletAssetsService: WalletAssetsService,
		@Inject(forwardRef(() => NftsProviderService)) private readonly nftsProviderService: NftsProviderService,
		@Inject(forwardRef(() => TransactionsProviderService))
		private readonly transactionsProviderService: TransactionsProviderService,
		@Inject(forwardRef(() => DaoService)) private readonly daoService: DaoService,
		@Inject(forwardRef(() => UserService)) private readonly userService: UserService
	) {}

	async enrichDynamicFields(
		wallets: Wallet[],
		daoMemberships: DaoMembership[],
		walletsBalance: Map<string, WalletBalance>
	): Promise<void> {
		await Promise.all(
			wallets.map(async (wallet) => {
				const walletBalance = walletsBalance.get(wallet.address) || { tokensBalance: [], valueUsd: 0 };
				if (wallet.type === TreasuryWalletType.SAFE) {
					wallet.type = TreasuryWalletType.SAFE;
					wallet.tokensBalance = walletBalance.tokensBalance;
					wallet.valueUsd = walletBalance.valueUsd;
				} else {
					const owners: WalletOwner[] = daoMemberships.map(({ user, role }) => ({
						...pick(user, ['walletAddress', 'avatar', 'displayName', 'id']),
						role,
						isDaoMember: true
					}));

					wallet.type = TreasuryWalletType.EXTERNAL;
					wallet.owners = owners;
					wallet.tokensBalance = walletBalance.tokensBalance;
					wallet.valueUsd = walletBalance.valueUsd;
				}
			})
		);
	}

	getWalletDao(wallet: Wallet) {
		return this.daoService.getWalletDao(wallet);
	}

	async checkUserAccess(
		daoId: string,
		walletType: TreasuryWalletType,
		walletAddress: string,
		userId: string,
		userWalletAddress: string
	) {
		await this.daoMembershipService.checkAccess(userId, daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		let chainId: number | null = null;

		if (walletType === TreasuryWalletType.SAFE) {
			const safes = await getAllChainSafes(userWalletAddress);
			const safe = safes?.find((safe) => getAddress(safe?.address) === getAddress(walletAddress));

			if (!safe) throw new ForbiddenError(`Not an owner`);
			chainId = safe.chainId || null;
		}
		if (walletType === TreasuryWalletType.EXTERNAL && getAddress(walletAddress) !== getAddress(userWalletAddress))
			throw new ForbiddenError(`Not an owner`);

		return chainId;
	}

	async getWalletBalance(
		covalentApi: CovalentApi,
		params: {
			address: string;
			currency?: string;
			chainId?: number;
			ecosystem?: EcosystemType;
		}
	): Promise<WalletBalance> {
		const { address, currency, chainId, ecosystem = EcosystemType.EVM } = params;

		const payload = {
			addresses: [address],
			ecosystem,
			chainId,
			take: 100,
			skip: 0
		};

		try {
			let tokensBalance: TokenBalance[];
			if (featureToggles.isEnabled('treasury_use_assets_service')) {
				const assetsV1 = await this.walletAssetsService.getCmcAssets(payload);

				if (assetsV1 === null) {
					return {
						tokensBalance: [],
						value: '0',
						valueUsd: 0
					};
				}

				tokensBalance = assetsV1.map((asset) => {
					return this.mapAssetToTokenBalance(asset);
				});

				return {
					tokensBalance,
					value: tokensBalance.reduce((bn, asset) => bn.plus(asset.value), new BigNumber(0)).toString(),
					valueUsd: tokensBalance.reduce((bn, asset) => bn.plus(asset.value), new BigNumber(0)).toNumber()
				};
			} else {
				return this.getBalanceWithCovalent(covalentApi, {
					address,
					currency,
					chainId
				});
			}
		} catch (error) {
			return {
				tokensBalance: [],
				value: '0',
				valueUsd: 0
			};
		}
	}

	async getWalletToBalance(
		covalentApi: CovalentApi,
		addresses: string[],
		currency?: string,
		chainId?: number,
		ecosystem?: EcosystemType
	): Promise<Map<string, WalletBalance>> {
		const walletToBalance = new Map<string, WalletBalance>();
		const payload = {
			addresses,
			ecosystem: ecosystem || EcosystemType.EVM,
			take: 100,
			skip: 0
		};

		if (featureToggles.isEnabled('treasury_use_assets_service')) {
			const assets = await this.walletAssetsService.getCmcAssets(payload);

			if (assets !== null) {
				const addressToTokenBalance = assets.reduce((acc, next) => {
					if (!acc.has(next.address)) {
						acc.set(next.address, []);
					}
					acc.get(next.address)!!.push(this.mapAssetToTokenBalance(next));
					return acc;
				}, new Map<string, TokenBalance[]>());

				addresses.forEach((address) => {
					const tokenBalance = addressToTokenBalance.get(address);
					if (tokenBalance) {
						walletToBalance.set(address, this.mapTokenBalanceToWalletBalance(tokenBalance));
					}
				});
			}
		} else {
			addresses.map(async (address) => {
				const balance = await this.getBalanceWithCovalent(covalentApi, { address, currency, chainId });
				walletToBalance.set(address, balance);
			});
		}

		return walletToBalance;
	}

	async getBalanceWithCovalent(
		covalentApi: CovalentApi,
		params: {
			address: string;
			currency?: string;
			chainId?: number;
		}
	): Promise<WalletBalance> {
		const { address, currency, chainId } = params;
		try {
			const tokensBalance = await this.getTokensBalanceWithCovalent(covalentApi, [address], currency, chainId);

			return this.mapTokenBalanceToWalletBalance(tokensBalance);
		} catch (error) {
			return {
				tokensBalance: [],
				value: '0',
				valueUsd: 0
			};
		}
	}

	async findWalletByIdOrFail(id: string) {
		return await this.walletRepository.findOneByOrFail({ id });
	}

	async getAllWallets() {
		const queryBuilder = this.walletRepository.createQueryBuilder('wallet');

		const wallets = await queryBuilder.getMany();

		return wallets;
	}

	async getDaoWallets(daoId: string) {
		const queryBuilder = this.walletRepository.createQueryBuilder('wallet');

		const wallets = await queryBuilder.where({ daoId }).orderBy({ main: 'DESC', 'wallet.createdAt': 'DESC' }).getMany();

		return wallets;
	}

	async createWallet({ daoId, name, description, address, main, chainId, type }: CreateWalletDto) {
		const sanitizedAddress = getAddress(address);
		if (!sanitizedAddress) throw new BadRequestException(`Bad wallet address checksum: ${address}`);

		const dao = await this.daoService.getById(daoId);
		if (!dao) throw new NotFoundError(`Dao with id: ${daoId} not found`);

		const wallet = await this.walletRepository
			.create({
				daoId: daoId,
				address: sanitizedAddress,
				name: name,
				description: description,
				type,
				main,
				chainId
			})
			.save();

		this.addWalletToWalletAssetsService(wallet);
		this.addWalletToWalletNftsService(wallet);
		this.addWalletToWalletTransactionsService(wallet);

		return wallet;
	}

	mapAssetToTokenBalance(asset: components['schemas']['AssetEntity']) {
		const {
			ecosystem,
			balance,
			chainId,
			cost,
			token: { address: tokenAddress, name, type, decimals, symbol, logo, price }
		} = asset;
		const priceValue = typeof price === 'number' ? price : price?.value;
		const tokenBalance: TokenBalance = {
			token: {
				type,
				address: tokenAddress,
				symbol,
				iconUrl: logo,
				chainId,
				name,
				ecosystem: ecosystem as EcosystemType,
				decimals
			},
			quote: {
				rate: priceValue.toString(),
				currency: 'USD'
			},
			value: cost && String(cost.value),
			amount: balance,
			ecosystem: ecosystem as EcosystemType,
			tokenAddress,
			symbol,
			name,
			decimals,
			logo,
			balance,
			valueUsd: cost && Number(cost.value),
			priceUsd: priceValue
		};
		return tokenBalance;
	}

	mapAssetToTokenBalanceV2(asset: components['schemas']['CostModel']) {
		const { ecosystem, chainId, name, symbol, contract, type, logo, decimals, price, balance, cost } = asset;

		const tokenBalance: TokenBalance = {
			token: {
				type,
				address: contract,
				symbol,
				iconUrl: logo,
				chainId: Number(chainId),
				name,
				ecosystem: ecosystem as EcosystemType,
				decimals
			},
			quote: {
				rate: price,
				currency: 'USD'
			},
			value: String(cost),
			amount: balance,
			ecosystem: ecosystem as EcosystemType,
			tokenAddress: contract,
			symbol,
			name,
			decimals,
			logo,
			balance,
			valueUsd: cost,
			priceUsd: Number(price)
		};
		return tokenBalance;
	}

	async checkRemoveWalletAccess(
		daoId: string,
		walletType: TreasuryWalletType,
		walletAddress: string,
		userId: string,
		userWalletAddress: string
	) {
		const [userMembership] = await this.daoMembershipService.findUserInDao(daoId, userId);
		const user = await this.userService.getUserById(userId);

		const { isSupervisor } = user || {};
		const hasAdminRights = this.daoMembershipService.hasAdminRights(userMembership?.role);
		const isDaoMember = Boolean(userMembership.role);

		if (!(isSupervisor || isDaoMember)) {
			throw new ForbiddenError('');
		}

		if (!hasAdminRights) {
			if (walletType !== TreasuryWalletType.EXTERNAL) {
				throw new ForbiddenError('No access to remove this type of wallet');
			}

			if (getAddress(walletAddress) !== getAddress(userWalletAddress)) {
				throw new ForbiddenError('Not an owner');
			}
		}
	}

	async checkCreateWalletAccess(
		daoId: string,
		walletType: TreasuryWalletType,
		walletAddress: string,
		userId: string,
		userWalletAddress: string
	) {
		const [userMembership] = await this.daoMembershipService.findUserInDao(daoId, userId);
		const user = await this.userService.getUserById(userId);

		const { isSupervisor } = user || {};
		const isDaoMember = Boolean(userMembership.role);

		let walletChainId = null;

		if (isSupervisor || isDaoMember) {
			if (walletType === TreasuryWalletType.SAFE) {
				const safes = await getAllChainSafes(userWalletAddress);
				const safe = safes?.find((safe) => getAddress(safe?.address) === getAddress(walletAddress));

				if (!safe) throw new ForbiddenError(`Not a safe owner`);

				walletChainId = safe.chainId || null;
			} else if (
				walletType === TreasuryWalletType.EXTERNAL &&
				getAddress(walletAddress) !== getAddress(userWalletAddress)
			) {
				throw new ForbiddenError(`Not an owner`);
			}
		} else {
			throw new ForbiddenError('');
		}

		return walletChainId;
	}

	async checkUpdateWalletAccess(
		daoId: string,
		walletType: TreasuryWalletType,
		walletAddress: string,
		userId: string,
		userWalletAddress: string
	) {
		const [userMembership] = await this.daoMembershipService.findUserInDao(daoId, userId);
		const user = await this.userService.getUserById(userId);

		const { isSupervisor } = user || {};
		const hasAdminRights = this.daoMembershipService.hasAdminRights(userMembership?.role);

		if (isSupervisor || hasAdminRights) {
			// TO-DO: TRE-332
		} else if (userMembership?.role === DaoMemberRole.Member) {
			if (walletType === TreasuryWalletType.EXTERNAL && getAddress(walletAddress) !== getAddress(userWalletAddress)) {
				throw new ForbiddenError(`Not an owner`);
			}
		} else {
			throw new ForbiddenError('');
		}
	}

	async deleteWallet(dto: DeleteWalletDto) {
		const wallet = await this.findWalletByIdOrFail(dto.id);
		if (wallet.main) return false;
		const dao = await this.getWalletDao(wallet);

		await this.checkRemoveWalletAccess(dao.id, wallet.type, wallet.address, dto.userId, dto.userWalletAddress);
		await this.walletRepository.delete(dto.id);

		const walletForDelete = {
			address: wallet.address,
			ecosystem: wallet.ecosystem
		};

		if (featureToggles.isEnabled('treasury_use_assets_service')) {
			await this.walletAssetsService.removeWallet(walletForDelete);
		}

		if (NftsProviderService.isWalletNftsServiceEnabled) {
			await this.nftsProviderService.removeWallet(walletForDelete);
		}

		if (featureToggles.isEnabled('treasury_use_wallet_transactions_service')) {
			await this.transactionsProviderService.removeWallet(walletForDelete);
		}

		return true;
	}

	async addWalletToWalletAssetsService(wallet: Wallet) {
		const { chainId, address, ecosystem } = wallet;
		if (featureToggles.isEnabled('treasury_use_assets_service')) {
			const walletForSync = {
				address,
				ecosystem,
				type: 'assets',
				chainId
			};
			const isAddedToAssetsService = await this.walletAssetsService.addWallet(walletForSync);
			if (isAddedToAssetsService) {
				const chains = chainId ? [chainId] : chainIds;
				await Promise.all(
					chains.map(async (chain) => this.walletAssetsService.scheduleSyncWallet({ ...walletForSync, chainId: chain }))
				);
			}
		}
	}

	async addWalletToWalletNftsService(wallet: Wallet) {
		if (NftsProviderService.isWalletNftsServiceEnabled) {
			await this.nftsProviderService.addWallet(wallet);
			await this.nftsProviderService.syncWallet(wallet);
		}
	}

	async syncWallet(address: string) {
		if (NftsProviderService.isWalletNftsServiceEnabled) {
			await this.nftsProviderService.syncWallet({ address });
		}
	}

	async addWalletToWalletTransactionsService(wallet: Wallet) {
		if (!featureToggles.isEnabled('treasury_use_wallet_transactions_service')) {
			return;
		}

		await this.transactionsProviderService.addWallet(wallet);
		await this.transactionsProviderService.syncWallet(wallet);
	}

	async updateMainWalletAddress(wallet: Wallet, newAddress: string): Promise<Wallet> {
		const { address: currentAddres, ecosystem } = wallet;
		wallet.address = newAddress;
		const updatedWallet = await this.walletRepository.save(wallet);
		if (featureToggles.isEnabled('treasury_use_assets_service')) {
			await this.walletAssetsService.removeWallet({ ecosystem, address: currentAddres });
			await this.addWalletToWalletAssetsService(updatedWallet);
		}
		return updatedWallet;
	}

	async getTokensBalanceWithCovalent(
		covalentApi: CovalentApi,
		addresses: string[],
		currency?: string,
		chainId?: number
	) {
		try {
			const chains = chainId ? [chainId] : chainIds;
			const responses = await Promise.all(
				addresses.flatMap((address) => {
					return chains.map(async (id) => {
						try {
							const items = await covalentApi.getBalance(id, address, currency);
							return items;
						} catch (e) {
							return [];
						}
					});
				})
			);
			const tokensBalance = flatten(responses);
			return tokensBalance.reduce(normalizeToken, []);
		} catch (e) {
			return [];
		}
	}

	async getTokensBalance(
		covalentApi: CovalentApi,
		addresses: string[],
		ecosystem?: EcosystemType,
		currency?: string,
		chainId?: number
	) {
		const payload = {
			addresses,
			ecosystem: ecosystem || EcosystemType.EVM,
			take: 100,
			skip: 0
		};

		if (featureToggles.isEnabled('treasury_use_assets_service')) {
			const assetsV2 = await this.walletAssetsService.getCmcAssetsSummary(payload);

			if (assetsV2 === null) {
				return [];
			}

			return assetsV2.map((asset) => {
				return this.mapAssetToTokenBalanceV2(asset);
			});
		} else {
			return this.getTokensBalanceWithCovalent(covalentApi, addresses, currency, chainId);
		}
	}

	mapTokenBalanceToWalletBalance(tokensBalance: TokenBalance[]) {
		return {
			tokensBalance,
			value: tokensBalance.reduce((bn, asset) => bn.plus(asset.value), new BigNumber(0)).toString(),
			valueUsd: tokensBalance.reduce((bn, asset) => bn.plus(asset.value), new BigNumber(0)).toNumber()
		};
	}

	async getWalletsWithBalance(covalentApi: CovalentApi, daoId: string): Promise<Wallet[]> {
		const wallets = await this.getDaoWallets(daoId);
		const addresses = wallets.map((wallet) => wallet.address);
		const walletsBalance = await this.getWalletToBalance(covalentApi, addresses);
		const daoMembers = await this.daoMembershipService.getAllMemberships(daoId);

		await this.enrichDynamicFields(wallets, daoMembers, walletsBalance);
		wallets.sort((a, b) => {
			if (a.main) {
				return -1;
			}
			if (b.main) {
				return 1;
			}
			return new BigNumber(b.valueUsd).minus(a.valueUsd).toNumber();
		});

		return wallets;
	}

	async getWalletWithBalance(covalentAPI: CovalentApi, id: string): Promise<Wallet | null> {
		const wallet = await this.walletRepository.findOneByOrFail({ id });
		const daoMembers = await this.daoMembershipService.getAllMemberships(wallet.daoId);
		const walletToBalance = await this.getWalletToBalance(covalentAPI, [wallet.address]);
		await this.enrichDynamicFields([wallet], daoMembers, walletToBalance);

		if (wallet.type === TreasuryWalletType.SAFE) {
			const safeInfo = await getSafeInfo(wallet.address, wallet?.chainId);

			const ownersAddresses = safeInfo.owners.map((ownerAddress: string) => getAddress(ownerAddress) || '');

			const ownersFromDao: WalletOwner[] = daoMembers
				.filter(({ user: { walletAddress } }) => ownersAddresses.includes(getAddress(walletAddress) || ''))
				.map(({ user, role }) => ({
					id: user.id,
					role,
					avatar: user.avatar,
					displayName: user.displayName,
					isDaoMember: true,
					walletAddress: getAddress(user.walletAddress) || ''
				}));

			const owners = ownersAddresses.reduce(
				(acc: WalletOwner[], address: string) =>
					concat(
						acc,
						defaultTo<WalletOwner>(
							find(ownersFromDao, ({ walletAddress }) => walletAddress === (getAddress(address) || '')),
							{
								walletAddress: getAddress(address) || '',
								displayName: null,
								isDaoMember: false,
								avatar: null,
								id: null,
								role: null
							}
						)
					),
				[]
			);

			wallet.owners = owners;
		}

		return wallet;
	}

	async getByAddresses(addresses: string[]): Promise<Wallet[]> {
		return this.walletRepository.find({
			where: {
				address: In(addresses)
			}
		});
	}

	async getWalletsName(daoId: string): Promise<WalletName[]> {
		return this.walletRepository.find({ where: { daoId }, select: ['address', 'name'] });
	}
}
