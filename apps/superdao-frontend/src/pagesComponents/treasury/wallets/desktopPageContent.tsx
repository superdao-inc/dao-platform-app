import isEmpty from 'lodash/isEmpty';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import { Title1, Body } from 'src/components';
import { getArtWrapperClass } from '../styles';
import { TreasuryWallets } from '../treasuryWallets';
import { TreasuryNavigation } from '../navigation';
import { colors } from 'src/style/variables';
import { CommonWalletFragment } from 'src/gql/treasury.generated';

type Props = {
	slug: string;
	isLoading: boolean;
	isTransactionSeriveEnabled: boolean;
	wallets: CommonWalletFragment[];
	daoId: string;
	hasAdminRights: boolean;
	walletAddress?: string;
	isMember: boolean;
};

export const WalletsDesktopPageContent: FC<Props> = ({
	slug,
	isLoading,
	isTransactionSeriveEnabled,
	wallets,
	daoId,
	hasAdminRights,
	walletAddress,
	isMember
}) => {
	const { t } = useTranslation();
	return (
		<>
			<TreasuryNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
			{isEmpty(wallets) && !isLoading ? (
				<div className={getArtWrapperClass()}>
					<Image src={'/assets/arts/emptyAssetsArt.svg'} priority={true} width={200} height={126} />

					<div>
						<Title1>{t('components.treasury.emptyState.wallets')}</Title1>
						<Body color={colors.foregroundTertiary}>{t('components.treasury.emptyState.walletsHint')}</Body>
					</div>
				</div>
			) : (
				<TreasuryWallets
					isPage={true}
					wallets={wallets}
					slug={slug}
					daoId={daoId}
					isLoading={isLoading}
					isCreator={hasAdminRights}
					currentUserAddress={walletAddress}
					isMember={isMember}
				/>
			)}
		</>
	);
};
