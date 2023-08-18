// base interface
import { BaseWalletApi } from 'src/providers/walletProvider/apis/baseWalletApi';

// shared
import { Chain } from '@sd/superdao-shared';

// env
import { config } from 'src/constants/environment';

// global magic link instance
import { magicLink, MagicLinkType } from 'src/libs/magicLink';

const {
	infura: { polygonUrl }
} = config;

const customNodeOptions = {
	rpcUrl: polygonUrl, // Polygon RPC URL
	chainId: Chain.Polygon // Polygon chain id
};

/**
 * Class provides magic.link wallet api.
 */
export class MagicLinkApi extends BaseWalletApi {
	magicLink: MagicLinkType;

	public static async getInstance(): Promise<MagicLinkApi | undefined> {
		if (!magicLink) return undefined;

		const magicLinkApi = new MagicLinkApi(magicLink.rpcProvider as any);

		magicLinkApi.magicLink = magicLink;

		return magicLinkApi;
	}

	isConnected(): boolean {
		return this.magicLink?.rpcProvider.connected || false;
	}

	isAvailable(): boolean {
		return !!this.magicLink;
	}

	override async enableProvider() {}

	// Magic link doesn't provider EIP-1193 events support
	onAccountChanged(): void {}
	onChainChanged(): void {}
	onConnect(): void {}
	onDisconnect(): void {}
	unsubscribeFromEvents(): void {}

	async getAccount(): Promise<string | undefined> {
		try {
			const metadata = await this.magicLink?.user.getMetadata();
			return metadata?.publicAddress ?? undefined;
		} catch (e) {
			return undefined;
		}
	}

	get chainId(): number | undefined {
		return customNodeOptions.chainId;
	}
}
