export const DAO_PER_DAY_CREATION = 'daoPerDayCreation';

export const getDefaultClaimDao = (slug: string) => ({
	avatar: 'f86b18de-5ff9-402b-b2ed-beb1468ac6a5',
	cover: '79bbf682-6b84-448c-ad25-495576b8d816',
	name: 'My DAO',
	description:
		'Welcome to your first DAO – you can learn, create and launch your project based on it. Every aspect is customizable – you can start your DAO journey by changing your DAO name and description. Check the Feed page to learn more',
	slug: slug,
	supportChatUrl: 'https://t.me/superdao_team',
	isVotingEnabled: true,
	hasDemoProposals: true
});
