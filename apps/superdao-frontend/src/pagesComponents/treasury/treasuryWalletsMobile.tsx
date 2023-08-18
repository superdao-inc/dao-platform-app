import React from 'react';
import { CommonWalletFragment } from 'src/gql/treasury.generated';
import { SkeletonWalletsBlockMobile } from './skeletonWalletsMobile';
import { TreasuryWalletMobile } from './treasuryWalletMobile';

type Props = {
	wallets: CommonWalletFragment[];
	isLoading: boolean;
};

export const TreasuryWalletsMobile: React.VFC<Props> = (props) => {
	const { wallets, isLoading } = props;

	return isLoading ? (
		<SkeletonWalletsBlockMobile />
	) : (
		<div className="mb-5 flex animate-[fadeIn_1s_ease-in] flex-col py-6" data-testid={'TreasuryWallets__wrapper'}>
			{wallets &&
				wallets.map((wallet) => {
					return <TreasuryWalletMobile key={wallet.id} wallet={wallet} />;
				})}
		</div>
	);
};
