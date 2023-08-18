import { useTranslation } from 'next-i18next';
import { memo, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Title2 } from 'src/components/text';
import { colors } from 'src/style';
import { UserNftsQuery } from 'src/gql/nft.generated';
import { NftCard } from 'src/components/nftCard';
import { NftCardTitle } from 'src/components/nftCard/nftCardTitle';
import { NftCardTierInfo } from 'src/components/nftCard/nftCardTierInfo';
import { NftCardDaoDescription } from 'src/components/nftCard/nftCardDaoDescription';
import { NftCardBadge } from 'src/components/nftCard/nftCardBadge';
import { getTierNameByMetadata } from 'src/utils/getTierNameByMetadata';
import { getDaoMemberPath } from 'src/features/user/constants';
import { UserNotificationsFragment } from 'src/gql/userNotification.generated';

type UserProfileNftsProps = {
	userId: string;
	userNfts: UserNftsQuery['userNfts'];
	nftNotifications?: UserNotificationsFragment[];
	isDaoTab: boolean;
	nftsBackLinkPath: string;

	className?: string;
};

const UserProfileNfts = (props: UserProfileNftsProps) => {
	const { userId, userNfts, nftNotifications, isDaoTab, nftsBackLinkPath, className = '' } = props;

	const { t } = useTranslation();

	const { push, query } = useRouter();
	const { slug: daoSlug, idOrSlug: userIdOrSlug } = query;

	const [newNfts, setNewNfts] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (nftNotifications) {
			setNewNfts((nftSet) => {
				nftNotifications.forEach((n) => {
					nftSet.add(n.newNftData!.id);
				});

				return nftSet;
			});
		}
	}, [nftNotifications]);

	const generatedNftsBackLinkPath = isDaoTab ? getDaoMemberPath(daoSlug as string, userId) : nftsBackLinkPath ?? '';

	const handleNftClick = useCallback(
		(tokenId: string, daoAddress: string) => {
			if (isDaoTab) {
				push(`${getDaoMemberPath(daoSlug as string, userIdOrSlug as string)}/${daoAddress}/${tokenId}`);
				return;
			}
			push(`${generatedNftsBackLinkPath}/${daoAddress}/${tokenId}`);
		},
		[daoSlug, generatedNftsBackLinkPath, isDaoTab, push, userIdOrSlug]
	);

	return (
		<div className={className}>
			<div className="flex gap-2">
				<Title2>{t('components.treasury.nfts_title.default')}</Title2>
				<Title2 className="inline" color={colors.foregroundTertiary}>
					{userNfts.length}
				</Title2>
			</div>
			<div className="relative mt-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
				{userNfts.map((nft) => {
					const { dao, tokenId, tokenAddress, name: nftName, metadata } = nft;
					const { id: daoId, name: daoNem, avatar: daoAvatar, contractAddress } = dao;

					const isNew = newNfts.has(tokenId);

					const tierName = getTierNameByMetadata(metadata);

					return (
						<NftCard
							key={`${tokenAddress}_${tokenId}`}
							onClick={() => handleNftClick(nft.tokenId, contractAddress || '')}
							artworkProps={{
								artworks: metadata ? [metadata] : [],
								sliderProps: { isSlider: true }
							}}
							badge={isNew && <NftCardBadge text={t('components.nft.new')} color={colors.tintCyan} />}
						>
							<NftCardTierInfo tier={tierName || ''} />

							<NftCardTitle className="mt-1" content={nftName ?? ''} />

							<NftCardDaoDescription className="mt-2" daoSeed={daoId} daoName={daoNem} avatar={daoAvatar} />
						</NftCard>
					);
				})}
			</div>
		</div>
	);
};

export default memo(UserProfileNfts);
