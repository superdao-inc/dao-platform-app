import { Body, Controller, HttpCode, Logger, Post, Query, Res } from '@nestjs/common';
import express from 'express';
import { WebhookService } from 'src/services/webhook/webhook.service';
import { WebhookFormMessageBodyData } from 'src/services/webhook/webhook.types';

@Controller()
export class WebhookController {
	private readonly logger = new Logger(WebhookController.name);

	constructor(private readonly webhookService: WebhookService) {}

	@HttpCode(200)
	@Post('/api/send-nft-reward')
	async sendClaimLinks(
		@Body() body: { data: string | WebhookFormMessageBodyData },
		@Query('daoAddress') daoAddress: string,
		@Res() res: express.Response
	) {
		let bodyData: WebhookFormMessageBodyData;
		try {
			bodyData = JSON.parse(body.data as string);
		} catch (e) {
			// for local testing
			bodyData = body.data as WebhookFormMessageBodyData;
		}

		this.logger.log(
			`sendNftReward: receive raw body ${JSON.stringify({
				body
			})}; daoId: ${daoAddress}`
		);

		this.logger.log(
			`sendNftReward: receive data ${JSON.stringify({
				lead2: bodyData.data.lead2,
				result: bodyData.data.result
			})}; daoId: ${daoAddress}`
		);

		this.webhookService.sendNftReward(daoAddress, bodyData).finally();

		res.end();
	}
}
