import copy from 'clipboard-copy';
import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';
import {
	Article2,
	BinanceSmartChainFilledIcon,
	BlockScanIcon,
	Body,
	Button,
	EthereumFilledIcon,
	IconButton,
	toast
} from 'src/components';
import { CopyIcon, PolygonScanIcon } from 'src/components/assets/icons';
import { ExternalLinkIcon } from 'src/components/assets/icons/externalLink';
import { useNetworksQuery } from 'src/gql/networks.generated';
import { colors } from 'src/style';
import { TreasuryWalletType } from 'src/types/types.generated';
import { formatUsdValue } from 'src/utils/formattes';
import { openExternal } from 'src/utils/urls';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { WalletTypeComponent } from './typeLabel';

type Props = {
	valueUsd?: number;
	description?: string | null;
	address: string;
	type: TreasuryWalletType;
	chainId: number | null;
	isValueLoading: boolean;
};

const chainIcons: {
	[key in number]: ReactElement;
} = {
	1: <EthereumFilledIcon width={20} height={20} />,
	137: <PolygonScanIcon />,
	56: <BinanceSmartChainFilledIcon width={20} height={20} />
};

const blockExplorers: {
	[key in number]: string;
} = {
	1: 'EtherScan',
	137: 'PolygonScan',
	56: 'BscScan'
};

const defaultBlockScanUrl = 'https://blockscan.com';

export const Dashboard = ({ valueUsd, description, address, type, chainId, isValueLoading }: Props) => {
	const { t } = useTranslation();

	const networks = useNetworksQuery().data?.networks;
	const network = networks?.find((chain) => chain.chainId === chainId);

	const handleCopy = () => {
		copy(address).then(() => toast(t('actions.confirmations.addressCopy'), { id: 'dashboard-address-copy' }));
	};

	const handleOpenScan = () => openExternal(`${network?.blockExplorerUrl || defaultBlockScanUrl}/address/${address}`);

	return (
		<div className="bg-backgroundSecondary mb-5 flex flex-col rounded-lg px-6 py-5">
			<div className="animate-[fadeIn_1s_ease-in]">
				{isValueLoading ? (
					<SkeletonComponent variant="rectangular" width={148} height={40} className="mt-3 mb-1 rounded-lg" />
				) : (
					<Article2 className="animate-[fadeIn_1s_ease-in]">{formatUsdValue(valueUsd, 2)} USD</Article2>
				)}
				<div className="mb-1 flex items-center gap-1">
					<Body color={colors.foregroundTertiary}>{address}</Body>
					<IconButton onClick={handleCopy} color="transparent" icon={<CopyIcon width={14} height={14} />} size="md" />
				</div>
				{description && (
					<Body className="line-clamp-3 overflow-hidden text-ellipsis break-words" color={colors.foregroundSecondary}>
						{description}
					</Body>
				)}
				<div className="mt-4 flex items-end gap-3">
					<WalletTypeComponent type={type} address={address} chainId={chainId} />
					<Button
						className="max-h-8"
						leftIcon={chainId ? chainIcons[chainId] : <BlockScanIcon />}
						rightIcon={<ExternalLinkIcon />}
						color="backgroundTertiary"
						size="md"
						label={chainId ? blockExplorers[chainId] : 'BlockScan'}
						onClick={handleOpenScan}
					/>
				</div>
			</div>
		</div>
	);
};
