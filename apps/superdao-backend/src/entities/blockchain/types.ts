/* eslint-disable no-shadow */

import { WhitelistParticipant } from 'src/entities/whitelist/whitelist.types';
import { AirdropParticipant, NftOwner, ParsedData, TotalPrice } from 'src/entities/nft/nft.types';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { SaleType } from '@sd/superdao-shared';

export type TransactionStatus = 'FINALIZED' | 'AWAIT_CONFIRMATION' | 'FAILED';

export type GetAdminListResponse = {
	[daoContractAddress: string]: string[];
};

export enum MessageType {
	BAN = 'BAN',
	BURN = 'BURN',
	CREATE_DAO = 'CREATE_DAO',
	AIRDROP = 'AIRDROP',
	WHITELIST_ADD = 'WHITELIST_ADD',
	WHITELIST_REMOVE = 'WHITELIST_REMOVE',
	WHITELIST = 'WHITELIST',
	WHITELIST_CLAIM = 'WHITELIST_CLAIM',
	BUY_NFT = 'BUY_NFT',
	BUY_WHITELIST_NFT = 'BUY_WHITELIST_NFT',
	BUY_ALLOWANCE = 'BUY_ALLOWANCE',
	CLAIM_NFT = 'CLAIM_NFT',
	CHANGE_MEMBER_ROLE = 'CHANGE_MEMBER_ROLE',
	LINK_CLAIM_NFT = 'LINK_CLAIM_NFT',
	REFERRAL_CLAIM_NFT = 'REFERRAL_CLAIM_NFT',
	NFT_ADMIN_UPDATE_COLLECTION = 'NFT_ADMIN_UPDATE_COLLECTION',
	NFT_ADMIN_UPDATE_SALE = 'NFT_ADMIN_UPDATE_SALE',
	NFT_ADMIN_SETUP_SALE = 'NFT_ADMIN_SETUP_SALE',
	AIRDROP_NFT_REWARD = 'AIRDROP_NFT_REWARD'
}

export type BanMessageData = {
	transactionHash: string;
	userToNotify: string;
	daoId: string;
	userToBan: { id: string; walletAddress: string; displayName: null | string };
	isGasless: boolean;
};

export type WhitelistRemoveMessageData = {
	transactionHash: string;
	userToNotify: string;
	daoId: string;
	userToBan: { id: string; walletAddress: string; displayName: null | string };
};

export type AirdropMessageData = {
	transactionHash: string;
	userToNotify: string;
	daoId: string;
	daoSlug: string;
	daoAddress: string;
	items: AirdropParticipant[];
	isGasless: boolean;
};

export type WhitelistAddMessageData = {
	transactionHash: string;
	userToNotify: string;
	daoId: string;
	daoSlug: string;
	daoAddress: string;
	whitelist: WhitelistParticipant[];
};

export type BuyNftMessageData = {
	email?: string;
	transactionHash: string;
	userToNotify: string;
	daoId: string;
	daoAddress: string;
	tier: string;
};

export type BuyWhitelistNftMessageData = {
	email: string;
	transactionHash: string;
	userToNotify: string;
	daoId: string;
	daoAddress: string;
	tier: string;
};

export type BuyAllowanceData = {
	tier: string;
	tokenAddress: string;
	userToNotify: string;
	daoAddress: string;
	transactionHash: string;
};

export type ClaimNftMessageData = {
	daoIdClaimFrom: string;
	daoNameClaimFrom: string;
	daoSlug: string;
	transactionHash: string;
	userToNotify: string;
	tier: string;
	id: string;
	deployDao?: boolean;
	createdDaoId?: string;
};

export type ReferralClaimNftMessageData = {
	transactionHash: string;
	daoAddressClaimFrom: string;
	userToNotify: string;
	tier: string;
	referralCampaignId: string;
	linkLimit?: number;
	referralLinkId?: string;
	claimSecret?: string;
};

export type CreateDaoMessageData = {
	transactionHash: string;
	daoId: string;
};

export type ChangeMemberRoleMessageData = {
	transactionHash: string;
	userToNotify: string;
	userId: string;
	daoId: string;
	daoSlug: string;
	role: DaoMemberRole;
};

export type NftAdminUpdateCollectionData = {
	transactionHash: string;
	daoId: string;
	daoAddress: string;
	userToNotify: string;
};

export type NftAdminUpdateSaleData = {
	transactionHash: string;
	daoId: string;
	daoAddress: string;
	userToNotify: string;
	type: SaleType;
};

export type AirdropNftRewardMessageData = {
	transactionHash: string;
	daoAddress: string;
	walletAddress: string;
	email: string;
	tier: string;
};

export type MessageData = {
	[MessageType.BAN]: BanMessageData;
	[MessageType.BURN]: BanMessageData;
	[MessageType.WHITELIST_REMOVE]: WhitelistRemoveMessageData;
	[MessageType.WHITELIST_ADD]: WhitelistAddMessageData;
	[MessageType.AIRDROP]: AirdropMessageData;
	[MessageType.BUY_NFT]: BuyNftMessageData;
	[MessageType.BUY_WHITELIST_NFT]: BuyWhitelistNftMessageData;
	[MessageType.BUY_ALLOWANCE]: BuyAllowanceData;
	[MessageType.CREATE_DAO]: CreateDaoMessage;
	[MessageType.WHITELIST_CLAIM]: WhitelistAddMessageData;
	[MessageType.CLAIM_NFT]: ClaimNftMessageData;
	[MessageType.CHANGE_MEMBER_ROLE]: ChangeMemberRoleMessageData;
	[MessageType.LINK_CLAIM_NFT]: ClaimNftMessageData;
	[MessageType.REFERRAL_CLAIM_NFT]: ReferralClaimNftMessageData;
	[MessageType.NFT_ADMIN_UPDATE_COLLECTION]: NftAdminUpdateCollectionData;
	[MessageType.NFT_ADMIN_UPDATE_SALE]: NftAdminUpdateSaleData;
	[MessageType.AIRDROP_NFT_REWARD]: AirdropNftRewardMessageData;
};

type TransactionMessageBase = {
	resendTimeout?: number;
	status?: TransactionStatus;
};

export type BanMessage = TransactionMessageBase & {
	type: MessageType.BAN | MessageType.BURN;
	data: BanMessageData;
};

export type WhitelistRemoveMessage = TransactionMessageBase & {
	type: MessageType.WHITELIST_REMOVE;
	data: WhitelistRemoveMessageData;
};

export type AirdropMessage = TransactionMessageBase & {
	type: MessageType.AIRDROP;
	data: AirdropMessageData;
};

export type WhitelistClaimMessage = TransactionMessageBase & {
	type: MessageType.WHITELIST_CLAIM;
	data: WhitelistAddMessageData;
};

export type WhitelistAddMessage = TransactionMessageBase & {
	type: MessageType.WHITELIST_ADD;
	data: WhitelistAddMessageData;
};

export type BuyNftMessage = TransactionMessageBase & {
	type: MessageType.BUY_NFT;
	data: BuyNftMessageData;
};

export type BuyWhitelistNftMessage = TransactionMessageBase & {
	type: MessageType.BUY_WHITELIST_NFT;
	data: BuyWhitelistNftMessageData;
};

export type BuyAllowanceMessage = TransactionMessageBase & {
	type: MessageType.BUY_ALLOWANCE;
	data: BuyAllowanceData;
};

export type CreateDaoMessage = TransactionMessageBase & {
	type: MessageType.CREATE_DAO;
	data: CreateDaoMessageData;
};

export type ClaimNftMessage = TransactionMessageBase & {
	resendTimeout?: number;
	type: MessageType.CLAIM_NFT | MessageType.LINK_CLAIM_NFT;
	data: ClaimNftMessageData;
};

export type ReferralClaimNftMessage = TransactionMessageBase & {
	type: MessageType.REFERRAL_CLAIM_NFT;
	data: ReferralClaimNftMessageData;
};

export type ChangeMemberRoleMessage = TransactionMessageBase & {
	type: MessageType.CHANGE_MEMBER_ROLE;
	data: ChangeMemberRoleMessageData;
};

export type NftAdminUpdateCollectionMessage = TransactionMessageBase & {
	type: MessageType.NFT_ADMIN_UPDATE_COLLECTION;
	data: NftAdminUpdateCollectionData;
};

export type NftAdminUpdateSaleMessage = TransactionMessageBase & {
	type: MessageType.NFT_ADMIN_UPDATE_SALE;
	data: NftAdminUpdateSaleData;
};

export type AirdropNftRewardMessage = TransactionMessageBase & {
	type: MessageType.AIRDROP_NFT_REWARD;
	data: AirdropNftRewardMessageData;
};

export type TransactionMessage =
	| BanMessage
	| AirdropMessage
	| WhitelistAddMessage
	| WhitelistRemoveMessage
	| WhitelistClaimMessage
	| BuyNftMessage
	| BuyWhitelistNftMessage
	| BuyAllowanceMessage
	| CreateDaoMessage
	| ClaimNftMessage
	| ReferralClaimNftMessage
	| ChangeMemberRoleMessage
	| NftAdminUpdateCollectionMessage
	| NftAdminUpdateSaleMessage
	| AirdropNftRewardMessage;

export type ArtworkType = {
	id: string;
	image: string;
	animationUrl?: string;
};

export type CollectionTierInfoResponse = {
	id: string;
	name: string;
	description: string;
	tierName: string;
	maxAmount: number;
	totalAmount: number;
	isDeactivated: number;
	artworks: ArtworkType[];
	artworksTotalLength: number;
	tierArtworkType: string;
	totalPrice: TotalPrice;
	currency: string;
	collectionAddress: string;
	isTransferable: boolean;
	collectionName: string;
	owners: Record<string, { name: string; tokenId: string }[]>;
};

export type CollectionArtworkResponse = ArtworkType[];

export type GetWalletTreasuryResponse = {
	result: string;
};

export type GetMemberListResponse = {
	[daoAddress: string]: ParsedData<NftOwner>[];
};
