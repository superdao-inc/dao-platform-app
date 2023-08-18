import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { BrokenCircuitError } from 'cockatiel';

import { CDN, Cover } from '@sd/superdao-shared';

import { config } from 'src/config';

import { GENERATING_ERROR, MAILFORMED_PARAMS_ERROR } from './constants';
import { PreviewApi } from './preview.api';

import { CollectionsService } from 'src/entities/collections/collections.service';
import { DaoService } from 'src/entities/dao/dao.service';
import { Dao } from 'src/entities/dao/dao.model';
import { CompositeBlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PreviewService {
	private readonly logger = new Logger(PreviewService.name);

	constructor(
		private readonly collectionsService: CollectionsService,
		private readonly daoService: DaoService,
		private readonly previewApi: PreviewApi,
		private readonly compositeBlockchainService: CompositeBlockchainService
	) {}

	async constructDaoProfileResponse(
		artworks: string[],
		tiersCount: number,
		dao: Dao,
		daoAvatarUrl: string | null | undefined,
		daoGradientFromColor: string,
		daoGradientToColor: string
	) {
		let params: any = {
			artworks: artworks ?? [],
			tiersCount,
			daoName: dao.name,
			daoDescription: dao.description
		};

		if (!daoAvatarUrl) {
			params = { ...params, daoGradientFromColor, daoGradientToColor };
		} else {
			params = { ...params, daoAvatar: daoAvatarUrl };
		}

		let jobResponse;
		try {
			jobResponse = await this.previewApi.registerDaoProfilePreview(params);
		} catch (e) {
			this.logger.error(`[preview generation] error while getting image buffer response`, { e, params });

			// circuit and retry errors can be handled like this
			if (e instanceof BrokenCircuitError) {
				throw new Error('service unavailable');
			} else {
				throw new Error(GENERATING_ERROR);
			}
		}

		if (!jobResponse.data) {
			this.logger.error(`[preview generation] error while getting job response`, { params });
			throw new Error(GENERATING_ERROR);
		}

		this.logger.log(`Registered preview job with params`, { params, jobResponse: jobResponse.data });

		try {
			const imageResponse = await this.previewApi.getImage(jobResponse.data.imageHashSum);

			return imageResponse.data;
		} catch (e) {
			this.logger.error(`[preview generation] error while getting image buffer response`, {
				params,
				jobResponse: jobResponse.data,
				retryError: false,
				e
			});
		}

		throw new Error(GENERATING_ERROR);
	}

	async generateDaoProfilePreview(slug: string) {
		if (!slug) throw new Error(MAILFORMED_PARAMS_ERROR);

		const dao = await this.daoService.getBySlug(slug as string);
		if (!dao) {
			this.logger.error(`[preview generation] error while getting dao`, { slug });
			throw new Error(GENERATING_ERROR);
		}

		const daoAvatarUrl = dao.avatar ? CDN.Uploadcare.optimizedFileURLByID(dao.avatar as string) : null;
		const [daoGradientFromColor, daoGradientToColor] = Cover.getCoverGradientColors(dao.id.split('').reverse().join());

		if (!dao.contractAddress) {
			return this.constructDaoProfileResponse([], 0, dao, daoAvatarUrl, daoGradientFromColor, daoGradientToColor);
		}

		const collection = await this.collectionsService.getCollection(dao.contractAddress);

		const activeTiers = collection.tiers.filter((tier) => !tier.isDeactivated);

		const artworks = activeTiers.map((tier) => tier.artworks[0]?.image).filter((image) => !!image);

		return this.constructDaoProfileResponse(
			artworks,
			activeTiers.length,
			dao,
			daoAvatarUrl,
			daoGradientFromColor,
			daoGradientToColor
		);
	}

	async generateClaimPreview(slug: string, tier: string, artworkId: number) {
		if (!tier || !slug) throw new Error(MAILFORMED_PARAMS_ERROR);

		const dao = await this.daoService.getBySlug(slug as string);
		if (!dao?.contractAddress) {
			this.logger.error(`[preview generation] error while getting dao`, { slug });
			throw new Error(GENERATING_ERROR);
		}

		const [collectionInfo, artworks] = await Promise.all([
			this.collectionsService.getCollection(dao.contractAddress),
			this.compositeBlockchainService.getCollectionArtworks(dao.contractAddress, tier)
		]);

		const collectionTier = collectionInfo.tiers.find(
			(collectionTier) => collectionTier.id.toLowerCase() === tier.toLowerCase()
		);

		if (!collectionTier?.artworks || !artworks.artworks.length) {
			this.logger.error(`[preview generation] error while getting collectionTier`, {
				daoAddress: dao.contractAddress,
				tier
			});
			throw new Error(GENERATING_ERROR);
		}

		const artwork = artworkId ? artworks.artworks?.[artworkId] : artworks.artworks?.[0];
		const artworkImage = artwork?.image;
		if (!artworkImage) {
			this.logger.error(`[preview generation] error while getting artwork image`, {
				collectionTier,
				artwork
			});
			throw new Error(GENERATING_ERROR);
		}

		const daoAvatarUrl = dao.avatar ? CDN.Uploadcare.optimizedFileURLByID(dao.avatar as string) : null;
		const [daoGradientFromColor, daoGradientToColor] = Cover.getCoverGradientColors(dao.id.split('').reverse().join());

		let params: any = {
			artwork: artwork,
			daoName: dao.name,
			tier: collectionTier.tierName || collectionTier.id,
			collectionName: collectionInfo.name,
			currentAmount: collectionTier.maxAmount - collectionTier.totalAmount,
			maxAmount: collectionTier.maxAmount
		};

		if (!daoAvatarUrl) {
			params = { ...params, daoGradientFromColor, daoGradientToColor };
		} else {
			params = { ...params, daoAvatar: daoAvatarUrl };
		}

		let imageBufferResponse = await axios({
			method: 'get',
			url: `${config.urls.previewGenServicesUrl}/generate-claim-preview`,
			responseType: 'arraybuffer',
			params
		});

		if (!imageBufferResponse.data) {
			this.logger.error(`[preview generation] error while getting image buffer response`, { params });
			throw new Error(GENERATING_ERROR);
		}

		this.logger.log(`Generated preview with params`, { params });

		return imageBufferResponse.data;
	}

	async generateUserNftPreview(slug: string, tier: string) {
		if (!tier || !slug) throw new Error(MAILFORMED_PARAMS_ERROR);
		const dao = await this.daoService.getBySlug(slug as string);
		if (!dao?.contractAddress) {
			this.logger.error(`[preview generation] error while getting dao`, { slug });
			throw new Error(GENERATING_ERROR);
		}

		const collectionInfoByTier = (await this.collectionsService.getCollectionInfoByTier(dao.contractAddress, tier))
			?.value;
		if (!collectionInfoByTier?.artworks) {
			this.logger.error(`[preview generation] error while getting collectionInfoByTier`, {
				daoAddress: dao.contractAddress,
				tier
			});
			throw new Error(GENERATING_ERROR);
		}
		const artwork = collectionInfoByTier.artworks[0].image;
		if (!artwork) {
			this.logger.error(`[preview generation] error while getting artwork image`, {
				collectionInfoByTier,
				artwork: collectionInfoByTier.artworks[0]
			});
			throw new Error(GENERATING_ERROR);
		}

		const daoAvatarUrl = dao.avatar ? CDN.Uploadcare.optimizedFileURLByID(dao.avatar as string) : null;
		const [daoGradientFromColor, daoGradientToColor] = Cover.getCoverGradientColors(dao.id.split('').reverse().join());

		let params: any = {
			artwork: artwork,
			daoName: dao.name,
			tier: collectionInfoByTier.name,
			collectionName: (collectionInfoByTier as any).collectionName,
			currentAmount: collectionInfoByTier.maxAmount - collectionInfoByTier.totalAmount,
			maxAmount: collectionInfoByTier.maxAmount
		};

		if (!daoAvatarUrl) {
			params = { ...params, daoGradientFromColor, daoGradientToColor };
		} else {
			params = { ...params, daoAvatar: daoAvatarUrl };
		}

		let imageBufferResponse = await axios({
			method: 'get',
			url: `${config.urls.previewGenServicesUrl}/generate-email-claim-preview`,
			responseType: 'arraybuffer',
			params
		});

		if (!imageBufferResponse.data) {
			this.logger.error(`[preview generation] error while getting image buffer response`, { params });
			throw new Error(GENERATING_ERROR);
		}

		this.logger.log(`Generated preview with params`, { params });

		return imageBufferResponse.data;
	}

	async generateNftPreview(slug: string, tier: string) {
		if (!tier || !slug) throw new Error(MAILFORMED_PARAMS_ERROR);
		const dao = await this.daoService.getBySlug(slug as string);
		if (!dao?.contractAddress) {
			this.logger.error(`[preview generation] error while getting dao`, { slug });
			throw new Error(GENERATING_ERROR);
		}

		const collectionInfoByTier = (await this.collectionsService.getCollectionInfoByTier(dao.contractAddress, tier))
			?.value;
		if (!collectionInfoByTier?.artworks) {
			this.logger.error(`[preview generation] error while getting collectionInfoByTier`, {
				daoAddress: dao.contractAddress,
				tier
			});
			throw new Error(GENERATING_ERROR);
		}
		const artwork = collectionInfoByTier.artworks[0].image;
		if (!artwork) {
			this.logger.error(`[preview generation] error while getting artwork image`, {
				collectionInfoByTier,
				artwork: collectionInfoByTier.artworks[0]
			});
			throw new Error(GENERATING_ERROR);
		}

		const daoAvatarUrl = dao.avatar ? CDN.Uploadcare.optimizedFileURLByID(dao.avatar as string) : null;
		const [daoGradientFromColor, daoGradientToColor] = Cover.getCoverGradientColors(dao.id.split('').reverse().join());

		let params: any = {
			artwork: artwork,
			daoName: dao.name,
			tier: collectionInfoByTier.name,
			collectionName: (collectionInfoByTier as any).collectionName,
			currentAmount: collectionInfoByTier.maxAmount - collectionInfoByTier.totalAmount,
			maxAmount: collectionInfoByTier.maxAmount
		};

		if (!daoAvatarUrl) {
			params = { ...params, daoGradientFromColor, daoGradientToColor };
		} else {
			params = { ...params, daoAvatar: daoAvatarUrl };
		}

		let imageBufferResponse = await axios({
			method: 'get',
			url: `${config.urls.previewGenServicesUrl}/generate-nft-preview`,
			responseType: 'arraybuffer',
			params
		});

		if (!imageBufferResponse.data) {
			this.logger.error(`[preview generation] error while getting image buffer response`, { params });
			throw new Error(GENERATING_ERROR);
		}

		this.logger.log(`Generated preview with params`, { params });

		return imageBufferResponse.data;
	}

	async generateShareLandingWidePreview(slug: string, tier: string) {
		if (!tier || !slug) throw new Error(MAILFORMED_PARAMS_ERROR);
		const dao = await this.daoService.getBySlug(slug as string);
		if (!dao?.contractAddress) {
			this.logger.error(`[preview generation] error while getting dao`, { slug });
			throw new Error(GENERATING_ERROR);
		}

		const collectionInfoByTier = (await this.collectionsService.getCollectionInfoByTier(dao.contractAddress, tier))
			?.value;
		if (!collectionInfoByTier?.artworks) {
			this.logger.error(`[preview generation] error while getting collectionInfoByTier`, {
				daoAddress: dao.contractAddress,
				tier
			});
			throw new Error(GENERATING_ERROR);
		}
		const artwork = collectionInfoByTier.artworks[0].image;
		if (!artwork) {
			this.logger.error(`[preview generation] error while getting artwork image`, {
				collectionInfoByTier,
				artwork: collectionInfoByTier.artworks[0]
			});
			throw new Error(GENERATING_ERROR);
		}

		const daoAvatarUrl = dao.avatar ? CDN.Uploadcare.optimizedFileURLByID(dao.avatar as string) : null;
		const [daoGradientFromColor, daoGradientToColor] = Cover.getCoverGradientColors(dao.id.split('').reverse().join());

		let params: any = {
			artwork: artwork,
			daoName: dao.name,
			daoAvatar: dao.avatar,
			tier: collectionInfoByTier.name,
			collectionName: (collectionInfoByTier as any).collectionName,
			currentAmount: collectionInfoByTier.maxAmount - collectionInfoByTier.totalAmount,
			maxAmount: collectionInfoByTier.maxAmount
		};

		if (!daoAvatarUrl) {
			params = { ...params, daoGradientFromColor, daoGradientToColor };
		} else {
			params = { ...params, daoAvatar: daoAvatarUrl };
		}

		let imageBufferResponse = await axios({
			method: 'get',
			url: `${config.urls.previewGenServicesUrl}/generate-share-landing-wide-preview`,
			responseType: 'arraybuffer',
			params
		});

		if (!imageBufferResponse.data) {
			this.logger.error(`[preview generation] error while getting image buffer response`, { params });
			throw new Error(GENERATING_ERROR);
		}

		this.logger.log(`[preview generation] generated preview with params`, { params });

		return imageBufferResponse.data;
	}

	async generateShareAmbassadorPreview(slug: string, tier: string) {
		if (!tier || !slug) throw new Error(MAILFORMED_PARAMS_ERROR);
		const dao = await this.daoService.getBySlug(slug as string);
		if (!dao?.contractAddress) {
			this.logger.error(`[preview generation] error while getting dao`, { slug });
			throw new Error(GENERATING_ERROR);
		}

		const collectionInfoByTier = (await this.collectionsService.getCollectionInfoByTier(dao.contractAddress, tier))
			?.value;
		if (!collectionInfoByTier?.artworks) {
			this.logger.error(`[preview generation] error while getting collectionInfoByTier`, {
				daoAddress: dao.contractAddress,
				tier
			});
			throw new Error(GENERATING_ERROR);
		}
		const artwork = collectionInfoByTier.artworks[0].image;
		if (!artwork) {
			this.logger.error(`[preview generation] error while getting artwork image`, {
				collectionInfoByTier,
				artwork: collectionInfoByTier.artworks[0]
			});
			throw new Error(GENERATING_ERROR);
		}

		const daoAvatarUrl = dao.avatar ? CDN.Uploadcare.optimizedFileURLByID(dao.avatar as string) : null;
		const [daoGradientFromColor, daoGradientToColor] = Cover.getCoverGradientColors(dao.id.split('').reverse().join());

		let params: any = {
			artwork: artwork,
			daoName: dao.name,
			daoAvatar: dao.avatar,
			tier: collectionInfoByTier.name,
			collectionName: (collectionInfoByTier as any).collectionName,
			currentAmount: collectionInfoByTier.maxAmount - collectionInfoByTier.totalAmount,
			maxAmount: collectionInfoByTier.maxAmount
		};

		if (!daoAvatarUrl) {
			params = { ...params, daoGradientFromColor, daoGradientToColor };
		} else {
			params = { ...params, daoAvatar: daoAvatarUrl };
		}

		let imageBufferResponse = await axios({
			method: 'get',
			url: `${config.urls.previewGenServicesUrl}/generate-share-ambassador-preview`,
			responseType: 'arraybuffer',
			params
		});

		if (!imageBufferResponse.data) {
			this.logger.error(`[preview generation] error while getting image buffer response`, { params });
			throw new Error(GENERATING_ERROR);
		}

		this.logger.log(`[preview generation] generated preview with params`, { params });

		return imageBufferResponse.data;
	}
}
