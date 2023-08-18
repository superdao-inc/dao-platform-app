import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';

import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import { useAirdropByWallet } from 'src/hooks';
import { airdropKey } from 'src/utils/toastKeys';
import { MetamaskError } from 'src/types/metamask';
import { useInfiniteGetDaoWhitelistQuery, useWhitelistAddEmailMutation } from 'src/gql/whitelist.generated';
import { WhitelistTargetsEnum } from 'src/types/types.generated';
import { SelectNftHookProps, HandleSendProps } from '../types';

export const useSelectAirdrop = ({ daoAddress, daoId }: Omit<SelectNftHookProps, 'formType'>) => {
	const { t } = useTranslation();
	const { push, query } = useRouter();
	const queryClient = useQueryClient();

	const { mutate, isLoading, isSuccess } = useAirdropByWallet();
	const {
		mutate: mutationAddByEmail,
		isLoading: isLoadingAddByEmail,
		isSuccess: isSuccessAddByEmail
	} = useWhitelistAddEmailMutation();

	const handleSend = async ({ data }: HandleSendProps) => {
		const byEmailAirdrop = data.members.filter((member) => !member.walletAddress && member.email);
		const byWalletAirdrop = data.members.filter((member) => member.walletAddress);

		if (!!byEmailAirdrop.length) {
			mutationAddByEmail(
				{ whitelistAddEmailData: { daoId, items: byEmailAirdrop } },
				{
					onError: (e) => {
						toast.error('Airdrop by email failed', {
							position: 'bottom-center',
							duration: 5000
						});
					},
					onSuccess: () => {
						//Если у нас нет аирдропа по адресам, тостом/редиректом/рефетчем управляем руками, не через rabbit
						if (!byWalletAirdrop.length) {
							toast.dismiss(airdropKey(daoId));
							toast.success(
								t('toasts.airdrop.success', {
									walletsCount: byEmailAirdrop.length,
									prefix: byEmailAirdrop.length > 1 ? 's' : ''
								}),
								{
									position: 'bottom-center',
									duration: 5000
								}
							);
							queryClient.refetchQueries(
								useInfiniteGetDaoWhitelistQuery.getKey({ daoId, target: WhitelistTargetsEnum.EmailClaim })
							);

							push(`/${query.slug}/members`);
						}
					}
				}
			);
		}

		if (!!byWalletAirdrop.length) {
			mutate(
				{
					daoAddress,
					// here we pass unsorted ones so that there is a correct count in the toast
					items: data.members
				},
				{
					onError: (error) => {
						toast.dismiss(airdropKey(daoId));
						let metamaskErrorMessage = t(`errors.metamask.${(error as MetamaskError).code}`, '');

						toast.error(metamaskErrorMessage || t('toasts.airdrop.failed'), {
							position: 'bottom-center',
							duration: 5000
						});
					}
				}
			);
		}
	};

	return {
		handleSend,
		isLoading: isLoading || isLoadingAddByEmail,
		isSuccess: isSuccess || isSuccessAddByEmail,
		titleKey: 'toasts.airdrop.loading.title',
		description: t('toasts.airdrop.loading.description')
	};
};
