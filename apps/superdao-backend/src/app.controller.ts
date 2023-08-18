import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	HttpCode,
	Inject,
	InternalServerErrorException,
	NotFoundException,
	Post,
	Query,
	Req
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import crypto from 'crypto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { WinstonAdapter, WINSTON_MODULE_PROVIDER } from '@dev/nestjs-common';
import { EthersService } from 'src/services/ethers/ethers.service';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { NftClientService } from 'src/entities/nft/nft-client.service';
import { SocketService } from 'src/services/socket/socket.service';
import { CollectionsService } from 'src/entities/collections/collections.service';
import { DaoService } from 'src/entities/dao/dao.service';
import { User } from 'src/entities/user/user.model';

@Controller()
export class AppController {
	constructor(
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonAdapter,
		private readonly configService: ConfigService,
		@InjectDataSource() private readonly dataSource: DataSource,
		private readonly nftClientService: NftClientService,
		private readonly socketService: SocketService,
		private readonly collectionsService: CollectionsService,
		private readonly daoService: DaoService,
		private readonly ethersService: EthersService
	) {
		this.logger.setContext(AppController.name);
	}

	@Get('test/log')
	async testLog() {
		this.logger.error(
			'Some error happened',
			{ a: 'a', b: 'b', e: new Error('descriptive error message') },
			'A conteext'
		);
		this.logger.error('Error while adding member to dao', { daoId: 3, userId: 4, role: 'member', tier: 'tier' });
		this.logger.error('Cannot format', new Error('Http error'));
		// @ts-expect-error
		this.logger.debug('error message', { e: new Error('Test error'), a: 'a', b: 123 }, { context: 'Controller' });
		// this.wst.error(new Error('Collection error'), { context: 'AppController' });
		// this.wst.error('Collection error', { context: 'AppController', trace: new Error('trace error') });
		this.logger.error('Get collection token voting weights error', new Error('Collection error'));
		this.logger.error('Get collection token voting weights error', String(new Error('Collection error')));
		this.logger.error('Get collection token voting weights error', { message: 'Collecion error' });

		this.logger.error('Get collection token voting weights error', 'scsc');

		this.logger.setContext({ userId: 'set context tst' });
		this.logger.error('Log after setContext', 'setContext');

		this.logger.setContext(AppController.name);
	}

	@HttpCode(200)
	@Post('test/websocket')
	async testWebsocket(@Body() body: any) {
		if (this.configService.get('appEnv') === 'prod') {
			throw new NotFoundException();
		}

		const { userId, topic, content } = body;
		this.socketService.sendPrivateMessage(userId, topic, content);
		return { status: 'ok' };
	}

	@HttpCode(200)
	@Get('test/user/subscriber')
	async testUserSubscriber() {
		if (this.configService.get('appEnv') === 'prod') {
			throw new NotFoundException();
		}

		await this.dataSource.manager.update(
			User,
			{ id: '3d742d01-e885-405b-bcf0-68fd558d9e43' },
			{
				walletAddress: crypto.randomBytes(8).toString('hex'),
				cover: 'qqqqqqqqqqqqq'
			}
		);

		return { status: 'ok' };
	}

	@HttpCode(200)
	@Post('/auth/exchange-cookie')
	async exchangeCookie(@Req() req: express.Request) {
		if (this.configService.get('appEnv') === 'prod') {
			throw new ForbiddenException('Not allowed');
		}

		return {
			session: req.session
		};
	}

	@Get('health')
	async health() {
		return { status: 'ok' };
	}

	@Post('fail')
	async fail() {
		if (this.configService.get('appEnv') === 'prod') {
			throw new NotFoundException();
		}

		throw new Error('Test error');
	}

	@HttpCode(200)
	@Post('test/mint')
	async testMint(@Body() body: any) {
		if (this.configService.get('appEnv') === 'prod') {
			throw new NotFoundException();
		}
		const data = await this.nftClientService.airdrop(body.daoAddress, body.whitelist);
		const txResponse = await this.ethersService.sendTransaction(data as any);
		this.logger.log('txResponse', txResponse);

		return null;
	}

	@Post('test/ens')
	async resolverEns(@Body() body: any) {
		if (this.configService.get('appEnv') === 'prod') {
			throw new NotFoundException();
		}

		const result = await Promise.all(
			body.map(async (item: any) => {
				const { walletAddress } = item;

				const resolvedAddress = await EnsResolver.resolve(walletAddress);

				return {
					...item,
					walletAddress: resolvedAddress
				};
			})
		);

		return result;
	}

	@Get('/api/collection_tokens_voting_weights')
	async getCollectionTokensVotingWeights(@Query('dao_address') daoAddress: string) {
		try {
			if (daoAddress && typeof daoAddress === 'string') {
				const nfts = await this.collectionsService.getCollectionNFTs(daoAddress);

				const dao = await this.daoService.getByAddress(daoAddress);

				const tokenWeights = nfts.map((nft) => {
					const tierWeight = dao?.tiersVotingWeights.find((tierVotingWeight) => tierVotingWeight.tierId === nft.tierId);

					return {
						[nft.tokenId]: tierWeight !== undefined ? tierWeight.weight : 1
					};
				});

				return tokenWeights;
			}

			return [];
		} catch (e) {
			this.logger.error('Get collection token voting weights error', e);
			throw new InternalServerErrorException('Getting weights error');
		}
	}
}
