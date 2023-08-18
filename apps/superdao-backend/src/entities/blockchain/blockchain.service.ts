import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import toCamelCase from 'camelcase-keys';
import { GetMemberListResponse } from './types';

@Injectable()
export class BloackchainService {
	constructor(private httpService: HttpService) {}

	async getMemberNftsByDaoAddresses(daoAddresses: string[]) {
		const response = await this.httpService.axiosRef.get<GetMemberListResponse>('/api/getMemberNftsByDaoAddresses', {
			data: { daoAddresses }
		});

		return toCamelCase(response.data, { deep: true }) as GetMemberListResponse;
	}
}
