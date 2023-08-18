import { Controller, Get, HttpException, HttpStatus, Logger, Query, Res } from '@nestjs/common';
import express from 'express';
import { PreviewService } from './preview.service';

@Controller()
export class PreviewController {
	private readonly logger = new Logger(PreviewController.name);

	constructor(private readonly previewService: PreviewService) {}

	@Get('/api/dao-profile-preview')
	async generateDaoProfilePreview(@Query('slug') slug: string, @Res() res: express.Response) {
		try {
			const result = await this.previewService.generateDaoProfilePreview(slug as string);

			res
				.set({
					'Content-Type': 'image/png',
					'Content-Length': result.length
				})
				.send(result);
		} catch (e) {
			this.logger.log(`[preview generation] error while generating dao profile preview with params`, { slug, e });
			throw new HttpException('error while generating preview', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res;
	}

	@Get('/api/dao-claim-preview')
	async generateClaimPreview(
		@Query('slug') slug: string,
		@Query('tier') tier: string,
		@Query('artworkId') artworkId: number,
		@Res() res: express.Response
	) {
		try {
			const result = await this.previewService.generateClaimPreview(slug, tier, artworkId);

			res
				.set({
					'Content-Type': 'image/png',
					'Content-Length': result.length
				})
				.send(result);
		} catch (e) {
			this.logger.log(`[preview generation] error while generating claim preview with params`, { slug, tier, e });
			throw new HttpException('error while generating preview', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res;
	}

	@Get('/api/email-nft-claim-preview')
	async generateUserNftPreview(@Query('slug') slug: string, @Query('tier') tier: string, @Res() res: express.Response) {
		try {
			const result = await this.previewService.generateUserNftPreview(slug as string, tier as string);
			res
				.set({
					'Content-Type': 'image/png',
					'Content-Length': result.length
				})
				.send(result);
		} catch (e) {
			this.logger.log(`[preview generation] error while generating email claim preview with params`, {
				slug,
				tier,
				e
			});
			throw new HttpException('error while generating preview', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res;
	}

	@Get('/api/nft-preview')
	async generateNftPreview(@Query('slug') slug: string, @Query('tier') tier: string, @Res() res: express.Response) {
		try {
			const result = await this.previewService.generateNftPreview(slug as string, tier as string);
			res
				.set({
					'Content-Type': 'image/png',
					'Content-Length': result.length
				})
				.send(result);
		} catch (e) {
			this.logger.log(`[preview generation] error while generating email claim preview with params`, {
				slug,
				tier,
				e
			});
			throw new HttpException('error while generating preview', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res;
	}

	@Get('/api/share-landing-preview')
	async generateShareLandingWidePreview(
		@Query('slug') slug: string,
		@Query('tier') tier: string,
		@Res() res: express.Response
	) {
		try {
			const result = await this.previewService.generateShareLandingWidePreview(slug as string, tier as string);
			res
				.set({
					'Content-Type': 'image/png',
					'Content-Length': result.length
				})
				.send(result);
		} catch (e) {
			this.logger.log(`[preview generation] error while generating share landing preview with params`, {
				slug,
				tier,
				e
			});
			throw new HttpException('error while generating preview', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res;
	}

	@Get('/api/share-ambassador-preview')
	async generateShareAmbassadorPreview(
		@Query('slug') slug: string,
		@Query('tier') tier: string,
		@Res() res: express.Response
	) {
		try {
			const result = await this.previewService.generateShareAmbassadorPreview(slug as string, tier as string);
			res
				.set({
					'Content-Type': 'image/png',
					'Content-Length': result.length
				})
				.send(result);
		} catch (e) {
			this.logger.log(`[preview generation] error while generating share ambassador preview with params`, {
				slug,
				tier,
				e
			});
			throw new HttpException('error while generating preview', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res;
	}
}
