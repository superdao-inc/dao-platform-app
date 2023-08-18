import { CreateDaoRequest } from 'src/validators/daos';

export type StepProps = {
	onSubmit: (data: Partial<CreateDaoRequest>) => void;
	onBack: () => void;
	name?: string;
	isLoading: boolean;
	hostname: string;
	accumulator: Partial<CreateDaoRequest>;
};
