import { tokens } from '@uniswap/default-token-list';
import groupBy from 'lodash/groupBy';
import { getAddress, EcosystemType } from '@sd/superdao-shared';
import { ERC20Token, ERC721Token, NativeToken, Token } from 'src/entities/token';

const erc20tokensFromUniswap: Token[] = tokens.map((item) => {
	const { name, symbol, decimals, chainId, address, logoURI } = item;

	return {
		type: 'ERC-20',
		name: name || symbol,
		iconUrl: logoURI,
		address: getAddress(address),
		ecosystem: EcosystemType.EVM,
		chainId,
		symbol: symbol.toUpperCase(),
		decimals
	};
});

const erc20tokensFromPancakeswap: ERC20Token[] = [
	{
		type: 'ERC-20',
		name: 'BNB',
		address: getAddress('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
		symbol: 'BNB',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c_1.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Wrapped BNB',
		address: getAddress('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'),
		symbol: 'WBNB',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c_1.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Tether USD',
		address: getAddress('0x55d398326f99059ff775485246999027b3197955'),
		symbol: 'USDT',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'PancakeSwap Token',
		address: getAddress('0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'),
		symbol: 'CAKE',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'BUSD Token',
		address: getAddress('0xe9e7cea3dedca5984780bafc599bd69add087d56'),
		symbol: 'BUSD',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Ethereum Token',
		address: getAddress('0x2170ed0880ac9a755fd29b2688956bd959f933f8'),
		symbol: 'ETH',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'BTCB Token',
		address: getAddress('0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'),
		symbol: 'BTCB',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Wrapped UST Token',
		address: getAddress('0x23396cf899ca06c4472205fc903bdb4de249d6fc'),
		symbol: 'UST',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xa47c8bf37f92abed4a126bda807a7b7498661acd.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Uniswap',
		address: getAddress('0xbf5140a22578168fd562dccf235e5d43a02ce9b1'),
		symbol: 'UNI',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'ChainLink Token',
		address: getAddress('0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd'),
		symbol: 'LINK',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'USD Coin',
		address: getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'),
		symbol: 'USDC',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Dai Token',
		address: getAddress('0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'),
		symbol: 'DAI',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Cardano Token',
		address: getAddress('0x3ee2200efb3400fabb9aacf31297cbdd1d435d47'),
		symbol: 'ADA',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x3ee2200efb3400fabb9aacf31297cbdd1d435d47.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Trust Wallet',
		address: getAddress('0x4b0f1812e5df2a09796481ff14017e6005508003'),
		symbol: 'TWT',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x4b0f1812e5df2a09796481ff14017e6005508003.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'yearn.finance',
		address: getAddress('0x88f1a5ae2a3bf98aeaf342d26b30a79438c9142e'),
		symbol: 'YFI',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'XRP Token',
		address: getAddress('0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe'),
		symbol: 'XRP',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Compound Coin',
		address: getAddress('0x52ce071bd9b1c4b00a0b92d298c512478cad67e8'),
		symbol: 'COMP',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xc00e94cb662c3520282e6f5717214004a7f26888.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'EOS Token',
		address: getAddress('0x56b6fb708fc5732dec1afc8d8556423a2edccbd6'),
		symbol: 'EOS',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x56b6fb708fc5732dec1afc8d8556423a2edccbd6.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Litecoin Token',
		address: getAddress('0x4338665cbb7b2485a8855a139b75d5e34ab0db94'),
		symbol: 'LTC',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x4338665cbb7b2485a8855a139b75d5e34ab0db94.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Bitcoin Cash Token',
		address: getAddress('0x8ff795a6f4d97e7887c79bea79aba5cc76444adf'),
		symbol: 'BCH',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x8ff795a6f4d97e7887c79bea79aba5cc76444adf.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Filecoin',
		address: getAddress('0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153'),
		symbol: 'FIL',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Cosmos Token',
		address: getAddress('0x0eb3a705fc54725037cc9e008bdede697f62f335'),
		symbol: 'ATOM',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x0eb3a705fc54725037cc9e008bdede697f62f335.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: '1INCH Token',
		address: getAddress('0x111111111117dc0aa78b770fa6a738034120c302'),
		symbol: '1INCH',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'NEAR Protocol',
		address: getAddress('0x1fa4a73a3f0133f0025378af00236f3abdee5d63'),
		symbol: 'NEAR',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x1fa4a73a3f0133f0025378af00236f3abdee5d63.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Ethereum Classic',
		address: getAddress('0x3d6545b08693dae087e957cb1180ee38b9e3c25e'),
		symbol: 'ETC',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x3d6545b08693dae087e957cb1180ee38b9e3c25e.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Basic Attention Token',
		address: getAddress('0x101d82428437127bf1608f699cd651e6abf9766e'),
		symbol: 'BAT',
		decimals: 18,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'CertiK Token',
		address: getAddress('0xa8c2b8eec3d368c0253ad3dae65a5f2bbb89c929'),
		symbol: 'CTK',
		decimals: 6,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xa8c2b8eec3d368c0253ad3dae65a5f2bbb89c929.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'Dogecoin',
		address: getAddress('0xba2ae424d960c26247dd6c32edc70b295c744c43'),
		symbol: 'DOGE',
		decimals: 8,
		chainId: 56,
		iconUrl: 'https://tokens.1inch.io/0xba2ae424d960c26247dd6c32edc70b295c744c43.png',
		ecosystem: EcosystemType.EVM
	},
	{
		type: 'ERC-20',
		name: 'LINK',
		address: getAddress('0x326C977E6efc84E512bB9C30f76E30c160eD06FB'),
		symbol: 'LINK',
		ecosystem: EcosystemType.EVM,
		decimals: 18,
		chainId: 80001,
		iconUrl:
			'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png'
	}
];

const nativeTokensEVM: NativeToken[] = [
	{
		type: 'NATIVE',
		name: 'Polygon',
		address: getAddress('0x0000000000000000000000000000000000001010'),
		symbol: 'MATIC',
		decimals: 18,
		ecosystem: EcosystemType.EVM,
		chainId: 137,
		iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png'
	},
	{
		type: 'NATIVE',
		name: 'Polygon',
		address: getAddress('0x0000000000000000000000000000000000001010'),
		symbol: 'MATIC',
		ecosystem: EcosystemType.EVM,
		decimals: 18,
		chainId: 80001,
		iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png'
	},
	{
		type: 'NATIVE',
		name: 'Ether',
		address: getAddress('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
		symbol: 'ETH',
		ecosystem: EcosystemType.EVM,
		decimals: 18,
		chainId: 1,
		iconUrl:
			'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
	},
	{
		type: 'NATIVE',
		name: 'Ether',
		address: getAddress('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
		symbol: 'ETH',
		ecosystem: EcosystemType.EVM,
		decimals: 18,
		chainId: 3,
		iconUrl:
			'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
	},
	{
		type: 'NATIVE',
		name: 'Ether',
		address: getAddress('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
		symbol: 'ETH',
		ecosystem: EcosystemType.EVM,
		decimals: 18,
		chainId: 42,
		iconUrl:
			'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
	}
];
export const getERC721Token = (address: string, tokenId: number, chainId: number, name?: string): ERC721Token => ({
	tokenId,
	address,
	chainId,
	type: 'ERC-721',
	name: `${name || ''} #${tokenId}`,
	symbol: '',
	ecosystem: EcosystemType.EVM,
	iconUrl: null,
	decimals: 0
});

export const allTokens = [...erc20tokensFromUniswap, ...erc20tokensFromPancakeswap, ...nativeTokensEVM];

/**
 * chainId → symbol|address → Token
 */
const tokensIndex: Map<Token['chainId'], Map<Token['symbol'], Token>> = new Map(
	Object.entries(groupBy(allTokens, 'chainId')).map(([chainId, items]) => {
		const bySymbolOrAddress: [string, Token][] = items.flatMap((item) => {
			return item.address
				? [
						[item.symbol, item],
						[item.address, item]
				  ]
				: [[item.symbol, item]];
		});
		return [Number(chainId), new Map(bySymbolOrAddress)];
	})
);

export const findTokenBySymbol = (params: { chainId: number; symbol: string }): Token | undefined =>
	tokensIndex.get(params.chainId)?.get(params.symbol.toUpperCase());

export const findTokenByAddress = (params: { chainId: number; address: string }): Token | undefined =>
	tokensIndex.get(params.chainId)?.get(getAddress(params.address) || '');
