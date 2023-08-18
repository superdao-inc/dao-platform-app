import { Module } from '@nestjs/common';
import { ContractService } from 'src/entities/contract/contract.service';
import { OpenSaleHelperService } from 'src/entities/contract/openSaleHelper.service';
import { wallet } from 'src/blockchain/common';
import { CacheModule } from 'src/services/cache/cache.module';
import { TreasuryHelperService } from 'src/entities/contract/treasuryHelper.service';
import { ClaimLinkHelperService } from 'src/entities/contract/claimLinkHelper.service';
import { AdminControllerHelperService } from 'src/entities/contract/adminControllerHelper.service';
import { PrivateSaleHelperService } from 'src/entities/contract/privateSaleHelper.service';
import { ERC721HelperService } from 'src/entities/contract/erc721Helper.service';
import { UpdateManagerHelperService } from 'src/entities/contract/updateManagerHelper.service';
import { Kernel__factory } from 'src/typechain';
import { SalesControllerHelperService } from 'src/entities/contract/salesControllerHelper.service';
import { ERC721PropertiesContract } from './erc721PropertiesContract';

@Module({
	imports: [CacheModule],
	providers: [
		ContractService,
		{
			provide: Kernel__factory,
			useValue: new Kernel__factory(wallet)
		},
		ERC721HelperService,
		OpenSaleHelperService,
		PrivateSaleHelperService,
		TreasuryHelperService,
		ClaimLinkHelperService,
		AdminControllerHelperService,
		UpdateManagerHelperService,
		ERC721PropertiesContract,
		SalesControllerHelperService
	],
	exports: [ContractService]
})
export class ContractModule {}
