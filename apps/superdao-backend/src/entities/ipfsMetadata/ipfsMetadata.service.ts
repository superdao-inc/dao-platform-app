import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ipfs from 'ipfs-http-client';
import { TierParams } from 'src/entities/contract/types';
import { ERC721CollectionMetadata, ERC721TokenMetadata } from 'src/types/metadata';
import { ipfsProxyUrl } from '@sd/superdao-shared';
import { getTokenMetadata } from './utils';

@Injectable()
export class IpfsMetadataService {
	private readonly _client: ipfs.IPFSHTTPClient;

	constructor(private readonly configService: ConfigService) {
		const infuraIpfsEndpoint = this.configService.get<number>('infura.ipfsEndpoint');
		const infuraIpfsProjectId = this.configService.get<number>('infura.ipfsProjectId');
		const infuraIpfsProjectSecret = this.configService.get<number>('infura.ipfsProjectSecret');
		const authorization = `Basic ${Buffer.from(`${infuraIpfsProjectId}:${infuraIpfsProjectSecret}`).toString(
			'base64'
		)}`;
		this._client = ipfs.create({
			url: `${infuraIpfsEndpoint}/api/v0`,
			headers: {
				authorization
			}
		});
	}

	async pushFileAndGetCid(file: File): Promise<string> {
		const ipfsResponse = await this._client.add(
			{
				content: await file.arrayBuffer()
			},
			{ pin: true }
		);

		return ipfsResponse.cid.toString();
	}

	async pushFileAndGetUri(f: File): Promise<string> {
		const cid = await this.pushFileAndGetCid(f);
		return `ipfs://${cid}`;
	}

	async pushMetadata(metadata: ERC721CollectionMetadata, tiers: Array<TierParams>): Promise<string> {
		const files = [
			{
				path: 'contract',
				content: JSON.stringify(metadata)
			}
		];

		for (const tier of tiers) {
			const { tierName: name, description: tierDescription, animation, attributes } = tier;

			const description = tierDescription ?? '';

			if (tier.images.length === 0) {
				files.push({
					path: tier.id.toUpperCase(),
					content: JSON.stringify(
						getTokenMetadata({ image: '', name, description, animation_url: animation?.[0] ?? '', attributes })
					)
				});
			} else if (tier.images.length === 1) {
				const image = tier.images[0];
				const animation_url = animation?.[0];
				files.push({
					path: tier.id.toUpperCase(),
					content: JSON.stringify(getTokenMetadata({ image, name, description, animation_url, attributes }))
				});
			} else {
				for (let i = 0; i < tier.images.length; i++) {
					const image = tier.images[i];
					const animation_url = animation?.[i];
					files.push({
						path: `${tier.id.toUpperCase()}/${i.toString()}`,
						content: JSON.stringify(getTokenMetadata({ image, name, description, animation_url, attributes }))
					});
				}
			}
		}

		let rootCid = '';
		for await (const result of this._client.addAll(files, { wrapWithDirectory: true, pin: true })) {
			if (result.path === '') {
				rootCid = result.cid.toString();
			}
		}

		return rootCid.toString();
	}

	async getCollectionMetadata(cid: string): Promise<ERC721CollectionMetadata> {
		const response = await fetch(`${ipfsProxyUrl}/ipfs/${cid}/contract`);

		return response.json();
	}

	async getTierMetadata(cid: string, postfix: string): Promise<ERC721TokenMetadata> {
		let str = '';
		for await (const chunk of this._client.cat(`${cid}/${postfix}`)) {
			str += new TextDecoder().decode(chunk);
		}

		return JSON.parse(str);
	}
}
