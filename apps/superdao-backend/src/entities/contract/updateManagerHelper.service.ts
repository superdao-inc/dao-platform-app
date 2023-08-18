import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { wallet } from 'src/blockchain/common';
import { UpdateManager, UpdateManager__factory } from 'src/typechain';

@Injectable()
export class UpdateManagerHelperService {
	updateManager: UpdateManager;

	constructor(configService: ConfigService) {
		const updateManagerProxyAddress = configService.get<string>('polygon.updateManagerProxy') ?? '';
		this.updateManager = UpdateManager__factory.connect(updateManagerProxyAddress, wallet);
	}

	getUpdateManagerContract() {
		return this.updateManager;
	}
}
