// for contract 0xa5f60F3802A89d0cEA4a26D97b9BdDe0F9417FEA
const testDaoTiers = {
	CB6C4040065F40C88736E5B1291BE06: 22, // 0-22 — Curious
	EB10216AA4214E75B568292275184A0: 26, // 23-26 — Fluent
	D11C6375B04B47B499110C12F19885F: 29, // 27-29 — Expert
	'992DF54A65B045D39422EDD74E38D3F': 31 // 30-31 — Native
};

export const PRODUCTION_TEST_DAO_ADDRESS = '0x822802714691f37b71bcee1766f69284daf4eec7';

export const STAGE_TEST_DAO_ADDRESS = '0xa5f60f3802a89d0cea4a26d97b9bdde0f9417fea';

export const daoRewardsMap = {
	// T3ST DAO - production
	[PRODUCTION_TEST_DAO_ADDRESS]: {
		D35343A0B0E24C2F931697F604B84B2: 22, // 0-22 — Crypto Curious
		'36B7D735D8194EDF946CF264201F60A': 26, // 23-26 — Crypto Fluent
		'1DC8A254EAD747548DE5AD4F858588A': 29, // 27-29 — Crypto Expert
		'1B32982113A94CF481E4BEE67BCE379': 31 // 30-31 — Crypto Native
	},
	// stage test dao
	[STAGE_TEST_DAO_ADDRESS]: testDaoTiers
};
