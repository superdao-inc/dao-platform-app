import { useMutation, useQueryClient } from 'react-query';
import { GetNextPageParamFunction } from 'react-query/types/core/types';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import pick from 'lodash/pick';
import { DoneIcon } from 'src/components/assets/icons/done';
import { NftToastContent } from 'src/components/toast/nftToastContent';
import { toast } from 'src/components/toast/toast';

import { DaoMembersQuery } from 'src/gql/daoMembership.generated';
import {
	CreateDaoMutationVariables,
	DaoBySlugQuery,
	PublicDaoFragment,
	useCreateDaoMutation,
	useDaoBySlugQuery,
	useDaoSalesQuery
} from 'src/gql/daos.generated';
import { useIsAuthorized } from 'src/features/auth/hooks/useIsAuthorized';
import { colors } from 'src/style';

import { GetDaoWhitelistQuery } from 'src/gql/whitelist.generated';
import * as Types from 'src/types/types.generated';
import { arrayOfAll } from 'src/types/type.utils';
// import { useCreateDaoTxQuery } from 'src/gql/transaction.generated';
// import { useWallet } from 'src/providers/walletProvider';

export const DEFAULT_MEMBERS_LIMIT = 20;

export const daoMembersOffsetGenerator: GetNextPageParamFunction<DaoMembersQuery> = (lastPage, allPages) => {
	if (lastPage?.daoMembers?.items?.length === DEFAULT_MEMBERS_LIMIT) {
		return {
			offset: allPages.length * DEFAULT_MEMBERS_LIMIT
		};
	}
};

export const daoWhitelistOffsetGenerator: GetNextPageParamFunction<GetDaoWhitelistQuery> = (lastPage, allPages) => {
	if (lastPage?.getDaoWhitelist?.items?.length === DEFAULT_MEMBERS_LIMIT) {
		return {
			offset: allPages.length * DEFAULT_MEMBERS_LIMIT
		};
	}
};

export const daoWhitelistEmailsOffsetGenerator: GetNextPageParamFunction<GetDaoWhitelistQuery> = (
	lastPage,
	allPages
) => {
	if (lastPage?.getDaoWhitelist?.items?.length === DEFAULT_MEMBERS_LIMIT) {
		return {
			offset: allPages.length * DEFAULT_MEMBERS_LIMIT
		};
	}
};

export const mapDaoDataToUpdate = (dao: PublicDaoFragment) => {
	type KeysUpdateDaoInput = keyof Types.UpdateDaoInput;
	const arrayOfAllowedKeys = arrayOfAll<KeysUpdateDaoInput>();
	const keys = arrayOfAllowedKeys([
		'avatar',
		'claimDeployDao',
		'contractAddress',
		'cover',
		'description',
		'discord',
		'documents',
		'ensDomain',
		'id',
		'instagram',
		'isClaimEnabled',
		'isInternal',
		'isVotingEnabled',
		'name',
		'openseaUrl',
		'site',
		'slug',
		'supportChatUrl',
		'tiersVotingWeights',
		'telegram',
		'twitter',
		'whitelistUrl'
	]);

	//links will be filtered by pick
	const mappedDao = {
		...dao,
		site: dao.links.site,
		twitter: dao.links.twitter,
		instagram: dao.links.instagram,
		telegram: dao.links.telegram,
		discord: dao.links.discord
	};

	return pick(mappedDao, keys);
};

export const useDaoCreate = (onSuccess?: () => void) => {
	// const { sendTransaction } = useWallet();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { t } = useTranslation();

	// eslint-disable-next-line consistent-return
	return useMutation(
		async (params: Omit<CreateDaoMutationVariables, 'hash'>) => {
			const { createDaoData } = params;
			// const { name } = createDaoData;

			try {
				// const { createDaoTx } = (await useCreateDaoTxQuery.fetcher({ name })()) || {};
				// if (!createDaoTx) throw new Error('Transaction failed');

				// const txResponse = await sendTransaction(createDaoTx);
				const data = await useCreateDaoMutation.fetcher({ createDaoData })();

				return data;

				// if (txResponse) {
				// 	const { hash } = txResponse;
				// 	const data = await useCreateDaoMutation.fetcher({ createDaoData, hash })();
				//
				// 	return data;
				// }

				// await Promise.reject();
			} catch (e) {
				await Promise.reject();
			}

			return undefined;
		},

		{
			onSuccess: (params, variables) => {
				onSuccess?.();
				const { createDaoData } = variables || {};
				const { name } = createDaoData || {};

				toast.dismiss(name);
				toast.success(
					<NftToastContent
						title={t('toasts.createDao.success.temporaryTitleToDelete')}
						// description={t('toasts.createDao.success.description')}
					/>,
					{
						position: 'bottom-center',
						duration: 5000,
						icon: <DoneIcon width={20} height={20} fill={colors.accentPositive} />
					}
				);

				queryClient.setQueryData<DaoBySlugQuery>(useDaoBySlugQuery.getKey({ slug: params!.createDao.slug }), {
					daoBySlug: params!.createDao
				});
				router.push(`/${params!.createDao.slug || params!.createDao.id}?isNew=1`);
			},
			onError: (error, variables) => {
				const { createDaoData } = variables || {};
				const { name } = createDaoData || {};
				toast.dismiss(name);
				toast.error(
					<NftToastContent
						title={t('toasts.createDao.failed.title')}
						description={t('toasts.createDao.failed.description')}
					/>,
					{
						position: 'bottom-center',
						duration: 5000
					}
				);
			}
		}
	);
};

export const useDaoSales = (daoId: string, isAuthorizedRequired = true) => {
	const isAuthorized = useIsAuthorized();
	const salesData = useDaoSalesQuery({ daoId }, { enabled: isAuthorizedRequired ? isAuthorized : true });

	const isWhitelistSaleActive = Boolean(salesData.data?.daoSales.sales?.ERC721_WHITELIST_SALE);

	const isOpenSaleActive = Boolean(salesData.data?.daoSales.sales?.ERC721_OPEN_SALE);

	const isSaleActive = Boolean(isWhitelistSaleActive || isOpenSaleActive);

	return {
		isLoading: salesData.isLoading,
		isError: salesData.isError,
		data: salesData.data?.daoSales,
		isWhitelistSaleActive,
		isOpenSaleActive,
		isSaleActive
	};
};
