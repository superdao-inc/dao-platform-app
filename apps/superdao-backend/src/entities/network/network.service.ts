import { Network } from '@sd/superdao-shared';
import { NetworkEntity } from './network.model';

export function toEntities(networks: Network[]) {
	return networks.map((n) => toEntity(n));
}

export function toEntity(network: Network) {
	const entity = new NetworkEntity();

	entity.ecosystem = network.ecosystem;
	entity.chainId = network.chainId;
	entity.title = network.title;
	entity.rpcUrl = network.rpcUrl;
	entity.blockExplorerUrl = network.blockExplorerUrl;
	entity.currencySymbol = network.currencySymbol;
	entity.isTestNet = network.isTestNet;

	return entity;
}
