import { useTranslation } from 'next-i18next';
import { polygonScanUrl } from 'src/constants';
import { Body, ExternalLinkIcon, Label1 } from 'src/components';
import { shrinkWallet } from '@sd/superdao-shared';
import { CHAIN_LABEL, ChainLabel } from '../helpers';

export type DetailsTabProps = {
	openseaLink?: string;
	chain: ChainLabel;
	contractAddress: string;
};

export const DetailsTab = ({ chain, openseaLink, contractAddress }: DetailsTabProps) => {
	const { t } = useTranslation();

	return (
		<div data-testid="NftCard__details">
			<div className="mb-3 flex w-full justify-between" data-testid="NftCard__network">
				<Body>{t('components.nftDetailsTab.details.network')}</Body>
				<Label1>
					<div className="flex items-center">
						<div className="mr-1.5 [&>svg]:h-4 [&>svg]:w-4">{CHAIN_LABEL[chain].icon}</div>
						{CHAIN_LABEL[chain].title}
					</div>
				</Label1>
			</div>
			{openseaLink && (
				<div className="mb-3 flex w-full justify-between" data-testid="NftCard__opensea">
					<Body>{t('components.nftDetailsTab.details.opensea')}</Body>
					<Label1>
						<a href={openseaLink} target="_blank" className="flex items-center" rel="noreferrer">
							{t('components.nftDetailsTab.details.viewOnOpensea')}
							<ExternalLinkIcon width={16} height={16} className="ml-1.5" />
						</a>
					</Label1>
				</div>
			)}
			<div className="flex w-full justify-between" data-testid="NftCard__contractAddress">
				<Body>{t('components.nftDetailsTab.details.contractAddress')}</Body>
				<Label1>
					<a
						href={`${polygonScanUrl}/address/${contractAddress}`}
						target="_blank"
						className="flex items-center"
						rel="noreferrer"
					>
						{shrinkWallet(contractAddress)} <ExternalLinkIcon width={16} height={16} className="ml-1.5" />
					</a>
				</Label1>
			</div>
		</div>
	);
};
