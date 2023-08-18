import { TreasuryWalletType } from 'src/types/types.generated';
import { CreateWalletRequest } from 'src/validators/wallets';

export type DefaultValuesType = {
	address: string;
	type: TreasuryWalletType;
};

export type StepProps = {
	onSubmit: (data: CreateWalletRequest) => void;
	onStepSuccess: (data: DefaultValuesType) => void;
	isLoading: boolean;
	daoId: string;
	daoSlug: string;
	params: DefaultValuesType;
	walletAddress: string;
	hasAdminRights: boolean;
};
