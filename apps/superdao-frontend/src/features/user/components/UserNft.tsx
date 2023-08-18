import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { useMemo } from 'react';
import { PageLoader } from 'src/components/common/pageLoader';
import { PageContent } from 'src/components/pageContent';
import { Name } from 'src/pagesComponents/common/header';
import { useSingleNftQuery } from 'src/gql/nft.generated';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { UserAPI } from 'src/features/user/API';
import { DetailsHead, DetailsLayout } from 'src/pagesComponents/nft/details';
import { getOpenseaNftUrl } from 'src/utils/urls';
import { TierInfo } from 'src/pagesComponents/nft/tierInfo';
import { ChainLabel } from 'src/pagesComponents/nft/helpers';
import { Owners, TierArtworkTypeStrings } from 'src/types/types.generated';
import { getDaoMemberPath } from '../constants';
import { shrinkWallet } from '@sd/superdao-shared';

type Props = {
	daoAddress: string;
	tokenId: string;
	fullUrl: string;
	isSharingEnabled: boolean;
	isCurrentUser: boolean;
	isDaoTab?: boolean;
	backPath?: string;
	tierName: string;
	userSlug?: string;
	owners?: Owners[];
	tierArtworkType?: TierArtworkTypeStrings;
};

export const UserNft = (props: Props) => {
	const {
		daoAddress,
		tokenId,
		isDaoTab,
		fullUrl,
		isSharingEnabled,
		isCurrentUser,
		tierName,
		backPath,
		userSlug,
		tierArtworkType,
		owners
	} = props;

	const { t } = useTranslation();
	const { push, query } = useRouter();
	const { slug, idOrSlug } = query;

	const { data: user } = UserAPI.useUserByIdOrSlugQuery({
		idOrSlug: isCurrentUser && userSlug ? userSlug : (idOrSlug as string)
	});
	const { userByIdOrSlug: userData } = user || {};

	const { data: nft, isLoading } = useSingleNftQuery({ tokenId, daoAddress });
	const { singleNft: nftData } = nft || {};

	const { name, metadata, dao, collectionAddress } = nftData || {};

	const amount = useMemo(
		() =>
			nftData
				? {
						maxAmount: nftData.amount ? +nftData.amount : undefined
				  }
				: undefined,
		[nftData]
	);
	const creatorProps = useMemo(
		() =>
			dao
				? {
						name: dao.name,
						slug: dao.slug,
						avatar: dao.avatar,
						id: dao.id
				  }
				: undefined,
		[dao]
	);
	const ownerProps = useMemo(
		() =>
			dao && userData
				? {
						name: userData?.displayName || userData?.ens || shrinkWallet(userData?.walletAddress) || '',
						slug: `${dao.slug}/members/${userData?.id}` || '',
						avatar: userData?.avatar,
						id: userData?.id || ''
				  }
				: undefined,
		[dao, userData]
	);

	const openseaUrl = collectionAddress ? getOpenseaNftUrl(collectionAddress, tokenId) : undefined;

	const tabsData: React.ComponentProps<typeof TierInfo> = useMemo(() => {
		return {
			overviewData: {
				description: nftData?.metadata?.description || ''
			},
			detailsData: {
				contractAddress: collectionAddress || '',
				openseaLink: openseaUrl,
				chain: 'polygon' as ChainLabel
			},
			ownersData: {
				collectionAddress: collectionAddress || '',
				owners: owners || [],
				slug: dao?.slug || '',
				tier: nftData?.tierId || '',
				isLimited: true
			}
		};
	}, [collectionAddress, dao, nftData, openseaUrl, owners]);

	if (isLoading) {
		return (
			<PageContent>
				<CustomHead
					main={nftData?.name ? nftData?.name : 'User NFT'}
					additional={nftData?.name ? 'User NFT' : 'Superdao'}
					description={'User NFT'}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	if (!dao) return null;

	const handleBack = () => {
		if (isDaoTab) {
			push(getDaoMemberPath(slug as string, idOrSlug as string));
			return;
		}
		push(backPath ?? '');
	};

	return (
		<PageContent onBack={handleBack}>
			<CustomHead
				main={tierName || name || 'User NFT'}
				additional={tierName || name ? 'User NFT' : 'Superdao'}
				description={'User NFT'}
			/>

			<Name className="mb-6 hidden lg:!block">{t('pages.nft.titleUserPage')}</Name>

			<MobileHeader className="mb-1" title={t('pages.nft.titleUserPage')} onBack={handleBack} />

			<DetailsLayout artworks={[metadata || {}]} artworksTotalLength={1}>
				<DetailsHead
					collectionName={name || ''}
					tierName={tierName}
					amount={amount}
					creator={creatorProps}
					owner={ownerProps}
					daoName={dao.name}
					isSharingEnabled={isSharingEnabled}
					isCurrentUser={isCurrentUser}
					tierArtworkType={tierArtworkType}
					fullUrl={fullUrl}
				/>
			</DetailsLayout>

			<TierInfo {...tabsData} />
		</PageContent>
	);
};
