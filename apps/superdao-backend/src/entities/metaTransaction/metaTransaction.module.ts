import { Module } from '@nestjs/common';
import { ContractModule } from 'src/entities/contract/contract.module';
import { AdminMetaTransactionService } from 'src/entities/metaTransaction/services/adminMetaTransaction.service';
import { AdminControllerHelperService } from 'src/entities/contract/adminControllerHelper.service';
import { wallet } from 'src/blockchain/common';
import { MetaTransactionResolver } from './metaTransaction.resolver';
import { Kernel__factory } from 'src/typechain';
import { CallForwarderService } from 'src/entities/metaTransaction/services/callForwarder.service';
import { GaslessWalletService } from 'src/entities/metaTransaction/services/gaslessWallet.service';
import { EmailModule } from 'src/services/email/email.module';
import { Erc721PropertiesMetaTransactionService } from 'src/entities/metaTransaction/services/erc721PropertiesMetaTransaction.service';
import { ERC721HelperService } from 'src/entities/contract/erc721Helper.service';

@Module({
	imports: [ContractModule, EmailModule],
	providers: [
		{
			provide: Kernel__factory,
			useValue: new Kernel__factory(wallet)
		},
		GaslessWalletService,
		AdminControllerHelperService,
		ERC721HelperService,
		Erc721PropertiesMetaTransactionService,
		CallForwarderService,
		MetaTransactionResolver,
		AdminMetaTransactionService
	],
	exports: [AdminMetaTransactionService]
})
export class MetaTransactionModule {}
