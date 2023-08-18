export type EmailData = {
	header: string;
	paragraphs: string[];
	tier?: {
		img: string;
		name: string;
	};
	dao?: {
		name: string;
		avatar: string;
		about?: string;
		hasAvatar?: boolean;
	};
	btnLabel: string;
	btnLink: string;
	isWhitelist?: boolean;
	isGrantRole?: boolean;
};

export type VariablesMap = Record<string, Record<string, unknown>>;

export type UsersWalletsMap = Record<
	string,
	{
		name: string;
	}
>;

export type UsersWalletAddressesMap = Record<
	string,
	{
		walletAddress: string;
	}
>;

export type UsersWelcomeParamsMap = Record<
	string,
	{
		walletAddress: string;
		tierName: string;
		tierImage: string;
	}
>;

export type UsersWhitelistClaimParamsMap = Record<
	string,
	{
		id: string;
		tierName: string;
		tierImage: string;
		tierId: string;
	}
>;

export type UsersIdsMap = Record<
	string,
	{
		id: string;
	}
>;

export type EmailPayload = {
	from: string;
	subject: string;
	html: string;
};

export type EmailConfirmationOptions = {
	token: string;
	userId: string;
	email: string;
	displayName?: string;
};
