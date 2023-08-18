import { CreateWalletDto } from 'src/entities/wallet/dto/createWallet.dto';

export const defaultTreasuryMainWalletMeta: Pick<Required<CreateWalletDto>, 'main' | 'name' | 'description'> = {
	main: true,
	name: 'DAO Wallet',
	description: 'This wallet is used to accumulate DAO funds and collect revenue from sales'
};
