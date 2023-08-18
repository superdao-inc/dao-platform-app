import { AirdropParticipant } from '../nft/nft.types';
import { WhitelistParticipant } from '../whitelist/whitelist.types';

export type LogTransactionFinalScenario = 'success' | 'fail';

export interface LogTransactionFinalizeParams {
	transactionHash: string;
	scenario: LogTransactionFinalScenario;
}

export interface BaseLogParams {
	transactionHash: string;
	executorId: string;
}

export interface BanLogParams extends BaseLogParams {
	bannedAddress: string;
	daoAddress: string;
	isBurnCase: boolean;
}

export interface AirdropLogParams extends BaseLogParams {
	participants: AirdropParticipant[];
	daoAddress: string;
}

export interface WhitelistLogParams extends BaseLogParams {
	participants: WhitelistParticipant[];
	daoAddress: string;
}

export interface BuyNftLogParams extends BaseLogParams {
	tier: string;
	daoAddress: string;
	isWhitelist: boolean;
}

export interface ClaimNftLogParams extends BaseLogParams {
	tier: string;
	daoAddress: string;
	createdDaoSLug: string;
	isLinkClaim: boolean;
}

export interface RefferalClaimLogParams extends BaseLogParams {
	tier: string;
	daoAddress: string;
	referralCampaignId: string;
	linkLimit: number;
	claimSecret?: string | null;
	referralLinkId?: string | null;
}
