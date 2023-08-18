import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { Body, Title1 } from 'src/components';
import { colors } from 'src/style';
import { NftInfo } from 'src/types/types.generated';
import { MobileHeader } from 'src/components/mobileHeader';
import { getArtWrapperClass } from '../styles';
import { MAX_PUBLIC_NFTS_COUNT } from '../shared/constants';
import { MobileNftsList } from './mobileNftsList';
import { MobileNavigation } from '../mobileNavigation';
import { MobileNftsPageSkeleton } from './mobileNftsPageSkeleton';

type Props = {
	slug: string;
	isTransactionSeriveEnabled: boolean;
	currentUserAddress?: string;
	isNftTransferEnabled: boolean;
	isQuickActionsEnabled: boolean;
	publicNfts: NftInfo[];
	privateNfts?: NftInfo[];
	isLoading?: boolean;
	isPublicNftsLoading?: boolean;
	isPrivateNftsLoading?: boolean;
	changeNftVisibility: (id: string, isPublic: boolean) => void;
	refetchPublicNfts: () => void;
	refetchPrivateNfts: () => void;
	showChangeVisibilityOption?: boolean;
	isMobile?: boolean;
	isCreator?: boolean;
	renderSentry: () => EmotionJSX.Element;
};

const MobileNfts = (props: Props) => {
	const {
		slug,
		isTransactionSeriveEnabled,
		currentUserAddress,
		isNftTransferEnabled,
		isQuickActionsEnabled,
		publicNfts,
		privateNfts,
		isLoading,
		isPrivateNftsLoading,
		isPublicNftsLoading,
		changeNftVisibility,
		refetchPrivateNfts,
		refetchPublicNfts,
		showChangeVisibilityOption,
		isCreator,
		isMobile,
		renderSentry
	} = props;

	const { t } = useTranslation();

	const hasPublicNfts = !isEmpty(publicNfts);
	const hasPrivateNfts = !isEmpty(privateNfts);
	const hasNfts = !isLoading && (hasPrivateNfts || hasPublicNfts);

	return (
		<>
			<Title1 className="mb-6 hidden">{t('pages.treasury.title')}</Title1>
			<MobileHeader withBurger title={t('pages.treasury.title')} />
			<MobileNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
			{isLoading && <MobileNftsPageSkeleton />}
			{!hasNfts && !isLoading ? (
				<div className="flex grow items-center justify-center">
					<div className={getArtWrapperClass(isMobile)}>
						<Image src={'/assets/arts/emptyAssetsArt.svg'} priority={true} width={200} height={126} />

						<div>
							<Title1>{t('components.treasury.emptyState.nfts')}</Title1>
							<Body color={colors.foregroundTertiary}>{t('components.treasury.emptyState.hint')}</Body>
						</div>
					</div>
				</div>
			) : (
				<>
					{hasPublicNfts && (
						<MobileNftsList
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
							isMobile={isMobile}
							transparentBackground
							showChangeVisibilityOption={showChangeVisibilityOption}
							{...{ isQuickActionsEnabled, isCreator, isNftTransferEnabled }}
						/>
					)}

					{hasPrivateNfts && (
						<MobileNftsList
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
							isMobile={isMobile}
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

export default MobileNfts;
