export enum DAO_TABS {
	ABOUT = 'about',
	MEMBERS = 'members',
	TREASURY = 'treasury',
	VOTING = 'voting',
	FEED = 'feed',
	SETTINGS = 'settings',
	PROFILE = 'profile',
	LEVELS = 'levels',
	ALL = 'all',
	LEADERBOARD = 'leaderboard',
	DISTRIBUTE = 'distribute',
	CUSTOM = 'custom?tab=collection',
	PUBLIC_SALE = 'custom?tab=publicSale',
	PRIVATE_SALE = 'custom?tab=privateSale',
	AIRDROP = 'members?isAirdrop=1',
	WHITELIST = 'members?isWhitelist=1',
	AUDIENCES = 'audiences',
	EARLY_ADOPTERS = 'audience_early_adopters',
	DEVELOPERS = 'audience_developers',
	TALENT_PROTOCOL = 'audience_talent_protocol',
	QUICKNODE = 'audience_quicknode',
	HITO_WALLET = 'audience_hito_wallet'
}

export enum USER_TABS {
	PROFILE = 'profile'
}

export type PageNavigationProps = {
	toggleIsNavigationShown: () => void;
};
