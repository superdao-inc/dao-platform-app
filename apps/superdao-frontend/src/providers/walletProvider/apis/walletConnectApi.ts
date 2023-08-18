import WalletConnectProvider from '@walletconnect/web3-provider';

// base interface
import { BaseWalletApi } from 'src/providers/walletProvider/apis/baseWalletApi';

// constants
import { config, infuraProjectId } from 'src/constants';

// shared
import { Chain, networkMap } from '@sd/superdao-shared';

// types
import { DisconnectError } from 'src/providers/walletProvider/types';

/*
 * WalletConnect
 * @desc: WalletConnect supported wallets map
 * NOTE: some wallets just doesn't work
 */
const desktopLinksMap = {
	Ambire: true,
	'Infinity Wallet': false,
	'KEYRING PRO': false,
	KryptoGO: false,
	Ledger: true,
	PunkWallet: true,
	RICE: false,
	SecuX: false,
	Tokenary: false,
	'Wallet 3': false
};

/**
 * Class provides wallet connect api.
 */
export class WalletConnectApi extends BaseWalletApi {
	private _walletConnectProvider: WalletConnectProvider;

	public static async getInstance() {
		const walletConnectProvider = new WalletConnectProvider({
			infuraId: infuraProjectId,
			rpc: {
				[Chain.Polygon]: networkMap[Chain.Polygon].rpcUrls[0]
			},
			qrcodeModalOptions: {
				desktopLinks: (Object.keys(desktopLinksMap) as Array<keyof typeof desktopLinksMap>).filter(
					(key) => desktopLinksMap[key]
				)
			},
			chainId: config.polygon.chainId
		});

		const walletConnectApi = new WalletConnectApi(walletConnectProvider);

		walletConnectApi._walletConnectProvider = walletConnectProvider;

		return walletConnectApi;
	}

	isConnected(): boolean {
		return this._walletConnectProvider.connected;
	}

	isAvailable(): boolean {
		return true;
	}

	onAccountChanged(callback: (account: string | undefined) => void) {
		this._walletConnectProvider.on('accountsChanged', (accounts: string[]) => {
			if (!Array.isArray(accounts)) return;

			if (Array.isArray(accounts) && typeof accounts[0] !== 'string') return;

			if (accounts.length === 0) {
				callback(undefined);
			} else if (accounts[0].toLowerCase() !== '') {
				callback(accounts[0].toLowerCase());
			}
		});
	}

	onChainChanged(callback: (chainId: number) => void) {
		this._walletConnectProvider.connector.on('chainChanged', (_, chainId: string) => callback(Number(chainId)));
	}

	onConnect(callback: (chainId: number) => void) {
		this._walletConnectProvider.connector.on('connect', (_, chainId: string) => callback(Number(chainId)));
	}

	onDisconnect(callback: (error: DisconnectError) => void) {
		this._walletConnectProvider.connector.on('disconnect', (error) => callback(new DisconnectError(error?.message)));
	}

	// Looks like this wallet connect will unsubscribe from all events by itself
	unsubscribeFromEvents() {}

	async getAccount(): Promise<string | undefined> {
		return this._walletConnectProvider.wc.accounts[0]?.toLowerCase();
	}

	get chainId(): number | undefined {
		return this._walletConnectProvider.wc.chainId;
	}
}
