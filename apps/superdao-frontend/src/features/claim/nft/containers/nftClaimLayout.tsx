import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import cn from 'classnames';

import {
	ArtworkView,
	Button,
	Caption,
	PageContent,
	InfoOutline,
	PolygonScanIcon,
	Title1,
	Avatar,
	CrossThinIcon
} from 'src/components';
import { CustomHead } from 'src/components/head';
import { NftMetaLabels, NftTierAndAmount } from 'src/features/checkout/internal/components';
import { DaoBySlugQuery } from 'src/gql/daos.generated';
import { getNftTypeData } from 'src/constants';
import { NftCollectionQuery } from 'src/gql/nft.generated';
import { useWallet } from 'src/providers/walletProvider';
import { shrinkWallet } from '@sd/superdao-shared';

type Props = {
	daoData: DaoBySlugQuery['daoBySlug'];
	tierData: Omit<NftCollectionQuery['collection'], 'description'> & NftCollectionQuery['collection']['tiers'][0];
	isClaiming: boolean;
	onClaim: () => void;
	showLoadingState: boolean;
	isEmailClaim?: boolean;
	onClose?: () => void;
};

export const NftClaimLayout: FC<Props> = (props) => {
	const { daoData, tierData, isClaiming, onClaim, isEmailClaim, showLoadingState, onClose } = props;

	const { t } = useTranslation();
	const { currentAccount } = useWallet();

	const { TierArtworkTypeIcon, title } = getNftTypeData(tierData.tierArtworkType);
	return (
		<PageContent columnSize="sm" className="min-h-screen" onClose={onClose}>
			<CustomHead
				main={daoData?.name ?? ''}
				additional="Claim"
				description={daoData?.description ?? ''}
				avatar={daoData?.avatar ?? ''}
			/>

			<div className="flex flex-col gap-2 sm:justify-center md:py-6" style={{ height: 'calc(100% - 60px)' }}>
				<Title1 className="bg-backgroundSecondary -mx-4 flex items-center px-4 py-3 sm:bg-transparent md:py-0">
					<CrossThinIcon
						className="fill-foregroundSecondary mr-4 inline-block h-6 w-6 cursor-pointer md:hidden"
						width={24}
						height={24}
						onClick={onClose}
					/>
					{t('pages.claim.nftClaiming.heading')}
				</Title1>
				<div className="text-foregroundPrimary md:text-foregroundSecondary mt-3 mb-1 text-center md:mt-0 md:mb-6 md:text-left">
					You got a free NFT from {daoData?.name}
				</div>
				<div className="sm:bg-backgroundSecondary relative mx-auto flex w-full max-w-[560px] flex-col items-center rounded-xl sm:p-6">
					<div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
						<ArtworkView
							artworks={tierData?.artworks}
							className="h-full w-full rounded-lg md:h-48 md:w-48 md:min-w-[12rem] "
						/>

						<div className="flex flex-col">
							<NftTierAndAmount
								name={tierData?.name ?? ''}
								totalAmount={tierData.totalAmount}
								maxAmount={tierData.maxAmount}
							/>

							<Title1>{tierData.tierName}</Title1>

							<NftMetaLabels
								className="mt-4"
								labels={[
									{
										icon: TierArtworkTypeIcon ? <TierArtworkTypeIcon /> : null,
										text: title || ''
									},
									{
										icon: <PolygonScanIcon />,
										text: 'Polygon'
									},
									{
										icon: <Avatar seed={daoData?.id} fileId={daoData?.avatar} size="xxs" />,
										text: daoData?.name || '',
										subText: 'Creator'
									}
								]}
							/>
						</div>
					</div>

					<Button
						className="mt-6 w-full"
						size="lg"
						color="accentPrimary"
						label={t(`pages.claim.${isEmailClaim ? 'emailNftClaiming.emailClaimForFree' : 'nftClaiming.getForFree'}`)}
						isLoading={isClaiming}
						disabled={isClaiming}
						onClick={onClaim}
					/>

					{currentAccount && (
						<div className="text-foregroundPrimary md:text-foregroundSecondary mt-3 text-center">
							NFT will be minted to {shrinkWallet(currentAccount)}
						</div>
					)}

					<div
						className={cn(
							'bg-backgroundTertiary absolute -bottom-[62px] flex h-[50px] w-full items-center justify-center gap-3 rounded-lg p-4 transition-opacity duration-500',
							showLoadingState ? 'opacity-100' : 'opacity-0'
						)}
					>
						<InfoOutline />
						<Caption className="text-foregroundSecondary">{t('pages.claim.nftClaiming.loading')}</Caption>
					</div>
				</div>
			</div>
		</PageContent>
	);
};
