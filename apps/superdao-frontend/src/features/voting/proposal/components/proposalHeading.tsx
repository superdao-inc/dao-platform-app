import { useTranslation } from 'next-i18next';
import copy from 'clipboard-copy';
import { useRouter } from 'next/router';

import { DropdownMenu } from './dropdownMenu';

import { ShareIcon, SubHeading, Title1, useDismissibleToast } from 'src/components';
import { ProposalStatus } from 'src/types/types.generated';
import Tooltip from 'src/components/tooltip';
import { MobileHeader } from 'src/components/mobileHeader';

type Props = {
	slug: string;
	proposal: string;
	status: ProposalStatus;
	isCreator: boolean;
	onBack?: () => void;
};

export const ProposalHeading = ({ slug, proposal, status, isCreator, onBack }: Props) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const { protocol, hostname, port } = window.location;
	const toast = useDismissibleToast(t('actions.confirmations.linkCopy'));

	const handleCopyLink = () => {
		copy(`${protocol}//${hostname}${port ? `:${port}` : ''}${asPath}`).then(() => toast.show());
	};

	return (
		<div className="mb-6 flex h-[56px] items-start justify-between">
			<Title1 className="hidden lg:block" data-testid={'ProposalDetails__title'}>
				{t('pages.votingProposal.heading')}
			</Title1>
			<MobileHeader title={t('pages.votingProposal.heading')} onBack={onBack} />
			<div className="mt-3 flex items-center gap-5 lg:mt-0">
				<Tooltip content={<SubHeading>{t('actions.labels.share')}</SubHeading>} placement="bottom">
					<div
						className="hover:bg-backgroundTertiaryHover flex h-7 w-7 cursor-pointer items-center justify-center rounded-full"
						onClick={handleCopyLink}
						data-testid={'ProposalDetails__shareButton'}
					>
						<ShareIcon width={24} height={24} />
					</div>
				</Tooltip>
				{isCreator && (
					<div className="hidden h-7 w-7 lg:block" data-testid={'ProposalDetails__dropdownMenu'}>
						<DropdownMenu className="h-7 w-7" slug={slug} proposal={proposal} status={status} />
					</div>
				)}
			</div>
		</div>
	);
};
