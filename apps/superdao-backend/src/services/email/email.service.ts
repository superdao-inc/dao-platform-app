import formData from 'form-data';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/dist/lib/client';
import { Injectable, Logger } from '@nestjs/common';
import chunk from 'lodash/chunk';
import pick from 'lodash/pick';

import { config } from 'src/config';

import { generateProposalStartedTemplate, ProposalStartedEmailProps } from './templates/newProposal';
import { generateProposalEndedTemplate, ProposalEndedEmailProps } from './templates/endedProposal';
import { generateWhitelistEmailClaimTemplate, WhitelistEmailClaimType } from './templates/whitelistEmailClaim';
import { BuyNftSuccessEmailProps, generateBuyNftSuccessTemplate } from './templates/buyNftSuccess';
import { generateNftSuccessTemplate, NftSuccessEmailProps } from './templates/nftSuccess';
import { generateWhitelistEmailTemplate, WhitelistEmailProps } from './templates/whitelistEmail';
import { AdminEmailProps, generateAdminEmailTemplate } from './templates/adminEmail';
import {
	EmailConfirmationOptions,
	EmailPayload,
	UsersWalletAddressesMap,
	UsersWalletsMap,
	UsersWelcomeParamsMap,
	UsersWhitelistClaimParamsMap,
	VariablesMap
} from './email.types';
import { generateWelcomeTemplate, WelcomeEmailProps } from './templates/welcome';
import { generateEmailConfirmationTemplate } from './templates/emailConfirmation';

const BATCH_CHUNK_SIZE = 1000;

@Injectable()
export class EmailService {
	client: Client;

	private readonly logger = new Logger(EmailService.name);

	constructor() {
		const mailgun = new Mailgun(formData);
		this.client = mailgun.client({ username: 'api', key: config.mailgun.apiKey, url: 'https://api.eu.mailgun.net' });
	}

	private sendMessage(to: string[], payload: EmailPayload, variables?: VariablesMap) {
		return chunk(to, BATCH_CHUNK_SIZE).map(async (toChunk) => {
			if (!toChunk.length) return;

			try {
				let chunkPayload: any = {
					...payload,
					to: toChunk
				};

				if (variables) {
					chunkPayload = { ...chunkPayload, ['recipient-variables']: JSON.stringify(pick(variables, toChunk)) };
				}

				return this.client.messages.create(config.mailgun.domain, chunkPayload);
			} catch (error) {
				return Promise.reject(error);
			}
		});
	}

	async sendBuyNftSuccessMessage(to: string[], data: BuyNftSuccessEmailProps) {
		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `Your new NFT from ${data.daoName} 🤩`,
			html: generateBuyNftSuccessTemplate({ ...data, daoLink: `https://app.superdao.co/${data.daoSlug}` })
		};

		try {
			const chunks = this.sendMessage(to, payload);

			this.logger.log('Buy nft success e-mails was sent with params: ', {
				to,
				data
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Buy nft success e-mails sending error: ', {
				error,
				params: { to, data }
			});
		}
	}

	async sendNftSuccessMessage(to: string[], data: NftSuccessEmailProps) {
		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `🦸 You’ve got a membership NFT from ${data.daoName}`,
			html: generateNftSuccessTemplate({ ...data, daoLink: `https://app.superdao.co/${data.daoSlug}` })
		};

		try {
			const chunks = this.sendMessage(to, payload);

			this.logger.log('Nft success e-mails was sent with params: ', {
				to,
				data
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Nft success e-mails sending error: ', {
				error,
				params: { to, data }
			});
		}
	}

	async sendWelcomeEmailMessage(
		to: string[],
		recipientVariablesByEmail: UsersWelcomeParamsMap,
		data: WelcomeEmailProps
	) {
		const recipientVariables = to.reduce((acc, email) => {
			acc[email] = recipientVariablesByEmail[email] ?? { walletAddress: '', tierName: '', tierImage: '' };
			return acc;
		}, {} as UsersWelcomeParamsMap);

		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `${data.daoName} membership NFT 🎊`,
			html: generateWelcomeTemplate({ ...data, daoLink: `https://app.superdao.co/${data.daoSlug}` })
		};

		try {
			const chunks = this.sendMessage(to, payload, recipientVariables);

			this.logger.log('Welcome e-mails was sent with params: ', {
				to,
				recipientVariablesByEmail,
				data
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Welcome e-mails sending error: ', {
				error,
				params: { to, recipientVariablesByEmail, data }
			});
		}
	}

	async sendWhitelistEmailMessage(
		to: string[],
		recipientVariablesByEmail: UsersWalletAddressesMap,
		data: WhitelistEmailProps
	) {
		const recipientVariables = to.reduce((acc, email) => {
			acc[email] = recipientVariablesByEmail[email] ?? { walletAddress: '' };
			return acc;
		}, {} as UsersWalletAddressesMap);

		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `You were whitelisted by ${data.daoName}`,
			html: generateWhitelistEmailTemplate({ ...data, daoLink: `https://app.superdao.co/${data.daoSlug}` })
		};

		try {
			const chunks = this.sendMessage(to, payload, recipientVariables);

			this.logger.log('Whitelist e-mails was sent with params: ', {
				to,
				recipientVariablesByEmail,
				data
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Whitelist e-mails sending error: ', {
				error,
				params: { to, recipientVariablesByEmail, data }
			});
		}
	}

	async sendAdminEmailMessage(to: string[], recipientVariablesByEmail: UsersWalletAddressesMap, data: AdminEmailProps) {
		const recipientVariables = to.reduce((acc, email) => {
			acc[email] = recipientVariablesByEmail[email] ?? { walletAddress: '' };
			return acc;
		}, {} as UsersWalletAddressesMap);

		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `You're now an admin of ${data.daoName}`,
			html: generateAdminEmailTemplate({ ...data, daoLink: `https://app.superdao.co/${data.daoSlug}` })
		};

		try {
			const chunks = this.sendMessage(to, payload, recipientVariables);

			this.logger.log('Admin e-mails was sent to: ', { to, recipientVariablesByEmail, data });

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Admin e-mails sending error: ', { error, params: { to, recipientVariablesByEmail, data } });
		}
	}

	async sendWhitelistEmailClaimMessage(
		to: string[],
		recipientVariablesByEmail: UsersWhitelistClaimParamsMap,
		data: WhitelistEmailClaimType
	) {
		// DAO Heroes has a claimDeployDao flag, others don't
		const subject = `${data.daoName} membership NFT 🎊`;

		const recipientVariables = to.reduce((acc, email) => {
			acc[email] = recipientVariablesByEmail[email] ?? { id: '', tierName: '', tierImage: '', tierId: '' };
			return acc;
		}, {} as UsersWhitelistClaimParamsMap);

		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject,
			html: generateWhitelistEmailClaimTemplate({
				...data,
				daoLink: `https://app.superdao.co/${data.daoSlug}/%recipient.tierId%?claim=email&claimId=%recipient.id%`
			})
		};

		try {
			const chunks = this.sendMessage(to, payload, recipientVariables);

			this.logger.log('Email-link-claim e-mails was sent with params: ', { to, recipientVariablesByEmail, data });

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Email-link-claim e-mails sending error: ', {
				error,
				params: { to, recipientVariablesByEmail, data }
			});
		}
	}

	async sendProposalStartedMessage(to: string[], usersWalletsMap: UsersWalletsMap, data: ProposalStartedEmailProps) {
		const recipientVariables = to.reduce((acc, email) => {
			acc[email] = usersWalletsMap[email] ?? { name: '' };
			return acc;
		}, {} as UsersWalletsMap);

		const payload: EmailPayload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `🦸 Just started a proposal of ${data.daoName}`,
			html: generateProposalStartedTemplate(data)
		};

		try {
			const chunks = this.sendMessage(to, payload, recipientVariables);

			this.logger.log('Proposal started e-mails was sent with params: ', {
				to,
				usersWalletsMap,
				data
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Proposal started e-mails sending error: ', {
				error,
				params: {
					to,
					usersWalletsMap,
					data
				}
			});
		}
	}

	async sendProposalEndedMessage(to: string[], usersWalletsMap: UsersWalletsMap, data: ProposalEndedEmailProps) {
		const recipientVariables = to.reduce((acc, email) => {
			acc[email] = usersWalletsMap[email] ?? { name: '' };
			return acc;
		}, {} as UsersWalletsMap);

		const payload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `🦸 Just ended a proposal of ${data.daoName}`,
			html: generateProposalEndedTemplate(data)
		};

		try {
			const chunks = this.sendMessage(to, payload, recipientVariables);

			this.logger.log('Proposal ended e-mails was sent with params: ', {
				to,
				usersWalletsMap,
				data
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Proposal ended e-mails sending error: ', {
				error,
				params: { to, usersWalletsMap, data }
			});
		}
	}

	async sendTopUpGaslessWalletMessage(balance: string, walletAddress: string) {
		const to = ['core@superdao.co', 'business@superdao.co'];
		const environment = config.env.isProd ? 'PROD' : 'DEV';

		const payload = {
			from: `Superdao <noreply@${config.mailgun.domain}>`,
			subject: `⚠️ [${environment}] Top up the wallet for gasless payments`,
			html: `<p>Current balance of ${walletAddress} is ${balance} MATIC. Please, send 20 MATIC to ${walletAddress} on Polygon.</p>`
		};

		const loggerParams = {
			to: to.join(', '),
			balance,
			from: payload.from,
			walletAddress
		};

		try {
			const chunks = this.sendMessage(to, payload);

			await Promise.all(chunks);

			this.logger.log(`Top up the wallet for gasless payments e-mail was sent with params: `, loggerParams);
		} catch (error) {
			this.logger.error(`Top up the wallet for gasless payments e-mail sending error: `, {
				error,
				params: loggerParams
			});
		}
	}

	async sendEmailConfirmationMessage({ token, userId, email, displayName }: EmailConfirmationOptions) {
		try {
			const { domain } = config.mailgun;

			this.logger.log('Email confirmation sent', { userId, email });

			const link = `https://app.superdao.co/email/verify/${token}`;
			const chunks = this.sendMessage([email], {
				from: `Superdao <noreply@${domain}>`,
				subject: `Email confirmation`,
				html: generateEmailConfirmationTemplate({ link, displayName })
			});

			return Promise.all(chunks);
		} catch (error) {
			this.logger.error('Failed to send confirmation email', { error, email });
		}
	}
}
