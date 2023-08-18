import { QueryObserverResult } from 'react-query';
import { PublicDaoFragment } from 'src/gql/daos.generated';

export type StepProps = {
	onStepSuccess: () => void;
	onBack: () => void;
	isLoading: boolean;
	dao: PublicDaoFragment;
	refetch: () => Promise<QueryObserverResult>;
	snapshotEnsDomain: string;
	setSnapshotEnsDomain: (domain: string) => void;
};

export enum ProposalType {
	ALL = 'all',
	ACTIVE = 'active',
	PENDING = 'pending',
	CLOSED = 'closed'
}
