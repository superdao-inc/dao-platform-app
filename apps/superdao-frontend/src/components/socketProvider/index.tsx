import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'next-i18next';

import { airdropAndWhitelistPageUrls } from 'src/constants';
import {
	AirdropMessageBody,
	BanMemberMessageBody,
	BuyNftMessageBody,
	BuyWhitelistNftMessageBody,
	ChangeMemberRoleMessageBody,
	MessageName,
	WhitelistMessageBody,
	NftAdminUpdateCollectionMessageBody,
	NftAdminUpdateSaleMessageBody,
	shrinkWallet
} from '@sd/superdao-shared';

import { DoneIcon, toast, MagicIcon } from 'src/components';
import { colors } from 'src/style';
import {
	airdropKey,
	banMemberKey,
	burnNftKey,
	buyNftKey,
	buyWhitelistNftKey,
	changeMemberRoleKey,
	nftAdminUpdateCollectionKey,
	nftAdminUpdateSaleKey,
	removeWhitelistWalletKey,
	whitelistKey
} from 'src/utils/toastKeys';
import { useInfiniteDaoMembersQuery } from 'src/gql/daoMembership.generated';
import { isBrowser } from 'src/utils/browser';
import { AuthAPI } from 'src/features/auth/API';
import { useInfiniteGetDaoWhitelistQuery } from 'src/gql/whitelist.generated';
import { WhitelistTargetsEnum } from 'src/types/types.generated';
import { useDaoBySlugWithRolesQuery, useDaoSalesQuery } from 'src/gql/daos.generated';
import { useNftAdminCollectionQuery } from 'src/gql/nftAdmin.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';

const opts = {
	transports: ['websocket'],
	withCredentials: true
};

let socket: Socket | null;
if (isBrowser) {
	socket = io(opts);
} else {
	socket = null;
}

export const socketConnection = socket;

export const SocketProvider = () => {
	const { t } = useTranslation();
	const { push } = useRouter();
	const queryClient = useQueryClient();
	const isAuthorized = AuthAPI.useIsAuthorized();

	if (isAuthorized && socket?.disconnected) socket?.connect();

	const handleTryRedirect = (slug: string) => {
		const path = window.location.href;

		for (const url of airdropAndWhitelistPageUrls) {
			if (path.includes(url)) {
				push(`/${slug}/members`);
				break;
			}
		}
	};

	useEffect((): any => {
		if (socket) {
			// log socket connection
			socket.on('connect', () => {});

			// Ban member:
			socket.on(MessageName.BAN_MEMBER_SUCCESS, async ({ daoId, displayName, walletAddress }: BanMemberMessageBody) => {
				queryClient.refetchQueries(useInfiniteDaoMembersQuery.getKey({ daoId, roles: null })).then();

				// cache updates
				await queryClient.invalidateQueries('UserNfts');
				await queryClient.invalidateQueries('NftCollection');
				await queryClient.invalidateQueries('CollectionInfoByTier');

				const name = displayName || shrinkWallet(walletAddress || '');

				toast.dismiss(banMemberKey(name, daoId));
				toast.success(t('toasts.banMember.success', { name }), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
			});

			socket.on(MessageName.BAN_MEMBER_FAILED, ({ daoId, displayName, walletAddress }: BanMemberMessageBody) => {
				const name = displayName || shrinkWallet(walletAddress || '');

				toast.dismiss(banMemberKey(name, daoId));
				toast.error(t('toasts.banMember.failed', { name }), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			socket.on(MessageName.BURN_NFT_SUCCESS, async ({ daoId, displayName, walletAddress }: BanMemberMessageBody) => {
				queryClient.refetchQueries(useInfiniteDaoMembersQuery.getKey({ daoId, roles: null })).then();

				// cache updates
				await queryClient.invalidateQueries('UserNfts');
				await queryClient.invalidateQueries('NftCollection');
				await queryClient.invalidateQueries('CollectionInfoByTier');
				await queryClient.removeQueries('UserNftsByDao');

				const name = displayName || shrinkWallet(walletAddress || '');

				toast.dismiss(burnNftKey(name, daoId));
				toast.success(t('toasts.burnNft.success', { name }), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
			});

			socket.on(MessageName.BURN_NFT_FAILED, ({ daoId, displayName, walletAddress }: BanMemberMessageBody) => {
				const name = displayName || shrinkWallet(walletAddress || '');

				toast.dismiss(burnNftKey(name, daoId));
				toast.error(t('toasts.burnNft.failed', { name }), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			// Airdrop
			socket.on(MessageName.AIRDROP_SUCCESS, async ({ daoId, daoSlug, walletsCount }: AirdropMessageBody) => {
				queryClient.refetchQueries(useInfiniteDaoMembersQuery.getKey({ daoId, roles: null })).then();
				queryClient
					.refetchQueries(useInfiniteGetDaoWhitelistQuery.getKey({ daoId, target: WhitelistTargetsEnum.EmailClaim }))
					.then();

				// cache updates
				await queryClient.invalidateQueries('UserNfts');
				await queryClient.invalidateQueries('NftCollection');
				await queryClient.invalidateQueries('CollectionInfoByTier');

				toast.dismiss(airdropKey(daoId));
				toast.success(t('toasts.airdrop.success', { walletsCount, prefix: walletsCount > 1 ? 's' : '' }), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
				handleTryRedirect(daoSlug);
			});
			socket.on(MessageName.AIRDROP_FAIL, ({ daoId }: AirdropMessageBody) => {
				toast.dismiss(airdropKey(daoId));
				toast.error(t('toasts.airdrop.failed'), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			// Remove whitelist participant:
			socket.on(MessageName.REMOVE_WHITELIST_SUCCESS, ({ daoId, walletAddress }: BanMemberMessageBody) => {
				queryClient
					.refetchQueries(useInfiniteGetDaoWhitelistQuery.getKey({ daoId, target: WhitelistTargetsEnum.Sale }))
					.then();
				const name = shrinkWallet(walletAddress || '');

				toast.dismiss(removeWhitelistWalletKey(name, daoId));
				toast.success(t('toasts.whitelist.successRemove', { name }), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
			});

			socket.on(MessageName.REMOVE_WHITELIST_FAILED, ({ daoId, walletAddress }: BanMemberMessageBody) => {
				const name = shrinkWallet(walletAddress || '');

				toast.dismiss(removeWhitelistWalletKey(name, daoId));
				toast.error(t('toasts.whitelist.failedRemove', { name }), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			// Whitelist claim or Whitelist add TODO: separate these 2 scenarios
			socket.on(MessageName.WHITELIST_SUCCESS, async ({ daoId, daoSlug, walletsCount }: WhitelistMessageBody) => {
				toast.dismiss(whitelistKey(daoId));

				// cache updates
				await queryClient.invalidateQueries('UserNfts');
				await queryClient.invalidateQueries('NftCollection');
				await queryClient.invalidateQueries('CollectionInfoByTier');

				toast.success(t('toasts.whitelist.success', { walletsCount }), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
				handleTryRedirect(daoSlug);
			});

			socket.on(MessageName.WHITELIST_FAIL, ({ daoId, walletsCount }: WhitelistMessageBody) => {
				toast.dismiss(whitelistKey(daoId));

				toast.error(t('toasts.whitelist.failed', { walletsCount }), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			// Buy nft
			socket.on(MessageName.BUY_NFT_SUCCESS, async ({ daoId, tier }: BuyNftMessageBody) => {
				// cache updates
				await queryClient.invalidateQueries('UserNfts');
				await queryClient.invalidateQueries('NftCollection');
				await queryClient.invalidateQueries('CollectionInfoByTier');

				toast.dismiss(buyNftKey(daoId, tier));
				toast.success(t('toasts.buyNft.success'), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
			});
			socket.on(MessageName.BUY_NFT_FAIL, ({ daoId, tier }: BuyNftMessageBody) => {
				toast.dismiss(buyNftKey(daoId, tier));
				toast.error(t('toasts.buyNft.fail'), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			// Buy whitelist nft
			socket.on(MessageName.BUY_WHITELIST_NFT_SUCCESS, async ({ daoAddress, tier }: BuyWhitelistNftMessageBody) => {
				// cache updates
				await queryClient.invalidateQueries('UserNfts');
				await queryClient.invalidateQueries('NftCollection');
				await queryClient.invalidateQueries('CollectionInfoByTier');

				toast.dismiss(buyWhitelistNftKey(daoAddress, tier));
				toast.success(t('toasts.buyNft.success'), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
				});
			});
			socket.on(MessageName.BUY_WHITELIST_NFT_FAIL, ({ daoAddress, tier }: BuyWhitelistNftMessageBody) => {
				toast.dismiss(buyWhitelistNftKey(daoAddress, tier));
				toast.error(t('toasts.buyNft.fail'), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			//change role
			socket.on(MessageName.CHANGE_MEMBER_ROLE_SUCCESS, ({ userId, daoId, daoSlug }: ChangeMemberRoleMessageBody) => {
				queryClient.refetchQueries(useDaoBySlugWithRolesQuery.getKey({ slug: daoSlug })).then();

				toast.dismiss(changeMemberRoleKey(userId, daoId));
				toast.success(t('toasts.changeRole.success'), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			socket.on(MessageName.CHANGE_MEMBER_ROLE_FAILED, ({ userId, daoId, daoSlug }: ChangeMemberRoleMessageBody) => {
				queryClient.refetchQueries(useDaoBySlugWithRolesQuery.getKey({ slug: daoSlug })).then();

				toast.dismiss(changeMemberRoleKey(userId, daoId));
				toast.error(t('toasts.changeRole.fail'), {
					position: 'bottom-center',
					duration: 5000
				});
			});

			// NFT admin update collection
			socket.on(
				MessageName.NFT_ADMIN_UPDATE_COLLECTION_SUCCESS,
				async ({ daoAddress }: NftAdminUpdateCollectionMessageBody) => {
					await queryClient.invalidateQueries('CollectionInfoByTier');
					await queryClient.invalidateQueries('CollectionArtworks');
					await queryClient.invalidateQueries(useNftAdminCollectionQuery.getKey({ daoAddress }));
					await queryClient.refetchQueries(useNftCollectionQuery.getKey({ daoAddress }));

					toast.dismiss(nftAdminUpdateCollectionKey(daoAddress));
					toast.success(t('toasts.updateCollection.success'), {
						position: 'bottom-center',
						duration: 5000,
						icon: <MagicIcon width={20} height={20} fill={colors.accentPrimary} />
					});
				}
			);

			socket.on(
				MessageName.NFT_ADMIN_UPDATE_COLLECTION_FAILED,
				({ daoAddress }: NftAdminUpdateCollectionMessageBody) => {
					toast.dismiss(nftAdminUpdateCollectionKey(daoAddress));
					toast.error(t('toasts.updateCollection.fail'), {
						position: 'bottom-center',
						duration: 5000
					});
				}
			);

			// NFT admin update sale
			socket.on(
				MessageName.NFT_ADMIN_UPDATE_SALE_SUCCESS,
				async ({ daoAddress, daoId }: NftAdminUpdateSaleMessageBody) => {
					await queryClient.invalidateQueries(useNftAdminCollectionQuery.getKey({ daoAddress }));
					await queryClient.invalidateQueries(useDaoSalesQuery.getKey({ daoId }));
					await queryClient.refetchQueries(useNftCollectionQuery.getKey({ daoAddress }));

					toast.dismiss(nftAdminUpdateSaleKey(daoAddress));
					toast.success(t('toasts.updateSale.success'), {
						position: 'bottom-center',
						duration: 5000,
						icon: <MagicIcon width={20} height={20} fill={colors.accentPrimary} />
					});
				}
			);

			socket.on(MessageName.NFT_ADMIN_UPDATE_SALE_FAILED, ({ daoAddress }: NftAdminUpdateSaleMessageBody) => {
				toast.dismiss(nftAdminUpdateSaleKey(daoAddress));
				toast.error(t('toasts.updateSale.fail'), {
					position: 'bottom-center',
					duration: 5000
				});
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
};
