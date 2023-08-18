import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQueryClient } from 'react-query';
import { HTMLAttributes, useState } from 'react';

import { DeleteProposalModal } from './deleteProposalModal';
import { DropdownMenu as Dropdown, EditIcon, TrashIcon } from 'src/components';
import { useDeleteProposalMutation } from 'src/gql/proposal.generated';
import { ProposalStatus } from 'src/types/types.generated';

type Props = HTMLAttributes<HTMLElement> & {
	slug: string;
	proposal: string;
	status: ProposalStatus;
};

export const DropdownMenu = ({ slug, proposal, status, className }: Props) => {
	const { push } = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const [isModalOpen, setIsModalOpen] = useState(false);

	const { mutateAsync: deleteProposal } = useDeleteProposalMutation();

	const handleDeleteProposal = () => {
		deleteProposal(
			{ proposalId: proposal },
			{
				onError: (error) => {}
			}
		).then(async (success) => {
			if (success.deleteProposal) {
				handleSwitchProposal();
				await queryClient.resetQueries('getAllProposals.infinite');
				await queryClient.resetQueries('snapshotProposals.infinite');
				push(`/${slug}/voting`);
			}
		});
	};

	const handleSwitchProposal = () => {
		setIsModalOpen(!isModalOpen);
	};

	const handleEditProposal = () => {
		push(`/${slug}/voting/${proposal}/edit`);
	};

	const options = [
		{
			label: t('pages.votingProposal.delete'),
			before: <TrashIcon width={24} height={24} />,
			onClick: handleSwitchProposal
		}
	];

	if (status === ProposalStatus.Pending) {
		options.push({
			label: t('pages.votingProposal.edit'),
			before: <EditIcon width={24} height={24} />,
			onClick: handleEditProposal
		});
	}

	return (
		<>
			<Dropdown className={className} options={options} />
			<DeleteProposalModal isOpen={isModalOpen} onClose={handleSwitchProposal} onSubmit={handleDeleteProposal} />
		</>
	);
};
