import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import isEmpty from 'lodash/isEmpty';
import { FC } from 'react';
import { Body, Title1 } from 'src/components';
import { CommonWalletFragment } from 'src/gql/treasury.generated';
import { colors } from 'src/style/variables';
import { MobileNavigation } from '../mobileNavigation';
import { getArtWrapperClass } from '../styles';
import { TreasuryWalletsMobile } from '../treasuryWalletsMobile';

type Props = {
	slug: string;
	isLoading: boolean;
	isTransactionSeriveEnabled: boolean;
	wallets: CommonWalletFragment[];
};

export const WalletsMobilePageContent: FC<Props> = ({ slug, isLoading, isTransactionSeriveEnabled, wallets }) => {
	const { t } = useTranslation();
	return (
		<>
			<MobileNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
			{isEmpty(wallets) && !isLoading ? (
				<div className={getArtWrapperClass(true)}>
					<Image className="h-full" src={'/assets/arts/emptyAssetsArt.svg'} priority={true} width={200} height={126} />
					<div>
						<Title1>{t('components.treasury.emptyState.wallets')}</Title1>
						<Body color={colors.foregroundTertiary}>{t('components.treasury.emptyState.walletsHint')}</Body>
					</div>
				</div>
			) : (
				<TreasuryWalletsMobile wallets={wallets} isLoading={isLoading} />
			)}
		</>
	);
};
