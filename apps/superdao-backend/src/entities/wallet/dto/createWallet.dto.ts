import { ChainId } from '@sd/superdao-shared';
import { TreasuryWalletType } from '../wallet.model';

export class CreateWalletDto {
	daoId: string;
	address: string;
	name: string;
	description?: string;
	main?: boolean;
	chainId?: ChainId;
	type?: TreasuryWalletType;
}
