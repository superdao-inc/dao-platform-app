import { Args, Context, Mutation, ObjectType, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';

import express from 'express';
import { Logger, UseGuards } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticationError } from 'apollo-server-core';
import { SocialPipe } from 'src/pipes/social.pipe';

// dto
import { CreateDaoInput } from 'src/entities/dao/dto/createDao.dto';

import { config } from 'src/config';

// entities
import { User } from 'src/entities/user/user.model';
import { Post } from 'src/entities/post/post.model';
import { DaoMemberRole, MemberRolesResponse } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';

// errors
import { NotFoundError, ValidationError } from 'src/exceptions';

// utils
import { validateFile, validateWhitelistUrl } from 'src/utils/upload';
import PaginatedResponse, { PaginationWithSort } from 'src/gql/pagination';

// services
import { DaoService } from 'src/entities/dao/dao.service';
import { isForbiddenDaoSlug } from 'src/utils/forbiddenSlugs';
import { AuthGuard } from 'src/auth.guard';
import { ContractService } from 'src/entities/contract/contract.service';
import { AllDaosFilter } from 'src/entities/dao/allDaosFilter.dto';
import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';
import { SLUG_MIN_LENGTH } from '@sd/superdao-shared';
import { UpdateDaoInput } from './dto/updateDao.dto';
import { DAO_PER_DAY_CREATION } from './constants';
import { Dao } from './dao.model';
import { UpdateVotingInput } from './dto/updateVoting.dto';
import { Links } from '../links/links.model';
import { LinksService } from '../links/links.service';

import { CheckSlugResponse, DaoSalesResponse } from './dao.types';

const {
	values: { daoMaxLimit }
} = config;

@ObjectType()
export class AllDaoResponse extends PaginatedResponse(Dao) {}

@Resolver(() => Dao)
export class DaoResolver {
	private readonly logger = new Logger(DaoResolver.name);

	constructor(
		@InjectRedis() private readonly redis: Redis,
		@InjectRepository(User) private userRepository: Repository<User>,
		@InjectRepository(Post) private postRepository: Repository<Post>,
		@InjectRepository(DaoMembership) private daoMembershipRepository: Repository<DaoMembership>,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly contractService: ContractService,
		private readonly linksService: LinksService,
		private readonly graphClient: GraphClient
	) {}

	@Query(() => DaoSalesResponse)
	async daoSales(@Args('daoId') daoId: string) {
		const dao = await this.daoService.getById(daoId);
		if (!dao?.contractAddress) throw new NotFoundError();

		return this.contractService.getSalesFromSaleController(dao.contractAddress);
	}

	@Query(() => Dao, { nullable: true })
	daoBySlug(@Args('slug') slug: string) {
		return this.daoService.getBySlug(slug);
	}

	@Query(() => Dao, { nullable: true })
	daoById(@Args('daoId') daoId: string) {
		return this.daoService.getById(daoId);
	}

	@Query(() => Dao, { nullable: true })
	daoByAddress(@Args('address') address: string) {
		return this.daoService.getByAddress(address);
	}

	// TODO: add authorization for blockchain ci pipeline
	@Query(() => AllDaoResponse, { name: 'allDaos' })
	async allDaos(
		@Args() getAllDaos: PaginationWithSort,
		@Args('filterAllDaos', { nullable: true }) filter: AllDaosFilter
	): Promise<AllDaoResponse> {
		const daos = await this.daoService.getAll(getAllDaos, filter);
		return daos;
	}

	@UseGuards(AuthGuard)
	@Query(() => CheckSlugResponse)
	async checkDaoSlug(@Args('slug') slug: string) {
		const result = await this.daoService.checkSlug(slug);
		if (!result) throw new NotFoundError();

		return result;
	}

	@Query(() => Boolean)
	async daoVerificationStatus(@Args('daoId') daoId: string) {
		return this.daoService.getIsDaoVerified(daoId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	async canCreateMoreDao() {
		const daoCount = await this.redis.get(DAO_PER_DAY_CREATION);

		return Number(daoCount) <= daoMaxLimit;
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => [DaoMembership])
	daoMembership(@Root() dao: Dao) {
		return this.daoMembershipRepository.findBy({ daoId: dao.id });
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => MemberRolesResponse)
	memberRoles(@Root() dao: Dao) {
		return this.daoMembershipService.memberRoles(dao.id);
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => [Post])
	posts(@Root() dao: Dao) {
		return this.postRepository.findBy({ daoId: dao.id });
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => String, { nullable: true })
	async collectionAddress(@Root() dao: Dao) {
		if (!dao.contractAddress) return null;

		const collection = await this.graphClient.daoCollection(dao.contractAddress.toLowerCase());

		return collection?.dao?.collection?.id || null;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Dao)
	async createDao(
		@Args('createDaoData', new SocialPipe()) createDaoData: CreateDaoInput,
		// @Args('hash') transactionHash: string,
		@Context('req') ctx: express.Request
	) {
		const { userId } = ctx.session!;
		return this.daoService.createDao(createDaoData, userId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Dao)
	async createDefaultDao(@Context('req') ctx: express.Request) {
		const { userId } = ctx.session!;
		const { createdDao, transactionHash } = await this.daoService.createDefaultDao(userId);
		this.logger.log('dao created', { userId, createdDao });

		await this.daoService.sendCreateDaoMessage(createdDao, transactionHash);
		await this.daoService.configureDefaultDao(createdDao);
		return createdDao;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Dao)
	async updateDaoVoting(
		@Args('updateVotingData') updateVotingData: UpdateVotingInput,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		await this.daoMembershipService.checkAccess(userId, updateVotingData.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const { id, tiersVotingWeights } = updateVotingData;

		const dao = await this.daoService.getById(id);
		if (!dao) {
			throw new NotFoundError();
		}

		if (tiersVotingWeights) dao.tiersVotingWeights = tiersVotingWeights;

		await dao.save();

		return dao;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Dao)
	async updateDao(
		@Args('updateDaoData', new SocialPipe()) updateDaoData: UpdateDaoInput,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const contextUser = await this.userRepository.findOneBy({ id: ctx.session?.userId });
		await this.daoMembershipService.checkAccess(userId, updateDaoData.id, [DaoMemberRole.Creator, DaoMemberRole.Admin]);

		const {
			id,
			contractAddress,
			avatar,
			cover,
			description,
			name,
			slug,
			twitter,
			telegram,
			instagram,
			site,
			discord,
			documents,
			tiersVotingWeights,
			whitelistUrl,
			supportChatUrl,
			ensDomain,
			isVotingEnabled,
			isClaimEnabled,
			isInternal,
			claimDeployDao,
			openseaUrl
		} = updateDaoData;

		const dao = await this.daoService.getById(id);
		if (!dao) {
			throw new NotFoundError();
		}

		if (!dao.hasShortSlugAccess) {
			if (name?.length < SLUG_MIN_LENGTH) {
				throw new ValidationError(`Name must be longer than ${SLUG_MIN_LENGTH} symbols`);
			}
			if (slug?.length < SLUG_MIN_LENGTH) {
				throw new ValidationError(`Slug must be longer than ${SLUG_MIN_LENGTH} symbols`);
			}
		}

		const isCoverValid = cover ? await validateFile(cover) : true;
		const isAvatarValid = avatar ? await validateFile(avatar) : true;
		if (!isCoverValid || !isAvatarValid) throw new ValidationError('File ids are not valid');

		const isWhitelistUrlValid = whitelistUrl ? validateWhitelistUrl(whitelistUrl) : true;
		if (!isWhitelistUrlValid) throw new ValidationError('whitelist url is incorrect');

		if (slug) {
			if (isForbiddenDaoSlug(slug)) {
				throw new ValidationError('Dao slug is invalid');
			}
			dao.slug = slug;
		}

		if (name) dao.name = name;
		if (description) dao.description = description;
		if (isInternal !== undefined && typeof isInternal === 'boolean') dao.isInternal = isInternal;

		if (tiersVotingWeights) dao.tiersVotingWeights = tiersVotingWeights;

		if (contractAddress !== undefined) dao.contractAddress = (contractAddress?.trim() || null) as any;
		if (avatar !== undefined) dao.avatar = avatar;
		if (cover !== undefined) dao.cover = cover;
		if (documents !== undefined) dao.documents = documents;

		dao.ensDomain = ensDomain || null;

		if (contextUser!.isSupervisor && typeof isVotingEnabled === 'boolean') dao.isVotingEnabled = isVotingEnabled;
		if (contextUser!.isSupervisor && typeof isClaimEnabled === 'boolean') dao.isClaimEnabled = isClaimEnabled;
		if (contextUser!.isSupervisor && typeof isClaimEnabled === 'boolean') dao.claimDeployDao = claimDeployDao;

		dao.openseaUrl = openseaUrl;
		dao.whitelistUrl = whitelistUrl;
		dao.supportChatUrl = supportChatUrl;

		let links = await this.linksService.getById(dao.links.id);

		if (!links) {
			links = new Links();
			links.entityId = id;
		}

		links.telegram = telegram;
		links.twitter = twitter;
		links.instagram = instagram;
		links.site = site;
		links.discord = discord;

		await links.save();

		dao.links = links;

		await dao.save();

		return dao;
	}

	@Query(() => Boolean)
	async isOpenSaleActive(@Args('daoAddress') daoAddress: string) {
		let isOpenSaleActive = false;

		try {
			isOpenSaleActive = await this.contractService.getIsOpenSaleActive(daoAddress);
		} catch (e) {
			this.logger.error(`[MulticurrencyOpenSale] Error while getting isOpenSaleActive: `, { daoAddress, e });
		}

		return isOpenSaleActive;
	}

	/**
	 * used only by supervisors and for adding all daos with short slug in DB access to use it (short slug validations rules)
	 */
	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async updateDaosWithShortSlugAccess(@Context('req') ctx: express.Request): Promise<boolean> {
		const userId = ctx.session?.userId;
		if (!userId) throw new AuthenticationError('Unauthorized');

		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user || ctx.session?.user || !user.isSupervisor) throw new AuthenticationError('Unauthorized');

		await this.daoService.updateDaosWithShortSlugs();

		return true;
	}
}
