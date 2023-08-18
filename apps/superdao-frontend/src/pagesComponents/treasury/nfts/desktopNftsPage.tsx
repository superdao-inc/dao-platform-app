import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { Body, Title1 } from 'src/components';
import { colors } from 'src/style';
import { NftInfo } from 'src/types/types.generated';
import { TreasuryNavigation } from '../navigation';
import { getArtWrapperClass } from '../styles';
import { NftsList } from '../nftsList';
import { MAX_PUBLIC_NFTS_COUNT } from '../shared/constants';

type Props = {
	slug: string;
	isTransactionSeriveEnabled: boolean;
	currentUserAddress?: string;
	isNftTransferEnabled: boolean;
	isQuickActionsEnabled: boolean;
	publicNfts: NftInfo[];
	privateNfts?: NftInfo[];
	isPublicNftsLoading?: boolean;
	isPrivateNftsLoading?: boolean;
	changeNftVisibility: (id: string, isPublic: boolean) => void;
	refetchPublicNfts: () => void;
	refetchPrivateNfts: () => void;
	showChangeVisibilityOption?: boolean;
	isCreator?: boolean;
	renderSentry: () => EmotionJSX.Element;
};

const DesktopNfts = (props: Props) => {
	const {
		slug,
		isTransactionSeriveEnabled,
		currentUserAddress,
		isNftTransferEnabled,
		isQuickActionsEnabled,
		publicNfts,
		privateNfts,
		isPrivateNftsLoading,
		isPublicNftsLoading,
		changeNftVisibility,
		refetchPrivateNfts,
		refetchPublicNfts,
		showChangeVisibilityOption,
		isCreator,
		renderSentry
	} = props;

	const { t } = useTranslation();

	const hasPublicNfts = !isEmpty(publicNfts);
	const hasPrivateNfts = !isEmpty(privateNfts);
	const hasNfts = hasPrivateNfts || hasPublicNfts;

	return (
		<>
			<Title1 className="mb-6">{t('pages.treasury.title')}</Title1>
			<TreasuryNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
			{!hasNfts ? (
				<div className={getArtWrapperClass()}>
					<Image src={'/assets/arts/emptyAssetsArt.svg'} priority={true} width={200} height={126} />

					<div>
						<Title1>{t('components.treasury.emptyState.nfts')}</Title1>
						<Body color={colors.foregroundTertiary}>{t('components.treasury.emptyState.hint')}</Body>
					</div>
				</div>
			) : (
				<>
					{hasPublicNfts && (
						<NftsList
							listTitle={{
								name: t('components.treasury.nfts_title.public'),
								count: publicNfts.length
							}}
							nfts={publicNfts.slice(0, MAX_PUBLIC_NFTS_COUNT)}
							isPage
							isLoading={isPublicNftsLoading}
							onChangeNftVisibility={changeNftVisibility}
							currentUserAddress={currentUserAddress}
							refetchList={refetchPublicNfts}
							transparentBackground
							showChangeVisibilityOption={showChangeVisibilityOption}
							{...{ isQuickActionsEnabled, isCreator, isNftTransferEnabled }}
						/>
					)}

					{hasPrivateNfts && (
						<NftsList
							listTitle={{
								name: t('components.treasury.nfts_title.hidden'),
								count: privateNfts?.length || 0
							}}
							nfts={privateNfts || []}
							isPage
							isLoading={isPrivateNftsLoading}
							onChangeNftVisibility={changeNftVisibility}
							currentUserAddress={currentUserAddress}
							refetchList={refetchPrivateNfts}
							transparentBackground
							showChangeVisibilityOption={showChangeVisibilityOption && publicNfts.length < MAX_PUBLIC_NFTS_COUNT}
							{...{ isQuickActionsEnabled, isCreator, isNftTransferEnabled }}
						/>
					)}

					{hasPrivateNfts && renderSentry()}
				</>
			)}
			;
		</>
	);
};

export default DesktopNfts;
