import { useTranslation } from 'next-i18next';

import difference from 'lodash/difference';
import { SelectNftHookProps, HandleSendProps } from '../types';

import { useAddWhitelistWallet } from 'src/hooks';
import { toast } from 'src/components';
import { whitelistKey } from 'src/utils/toastKeys';
import { WhitelistAddWalletsTxQueryVariables } from 'src/gql/transaction.generated';
import { MetamaskError } from 'src/types/metamask';

export const useSelectWhitelist = ({ daoAddress, daoId, tiers }: Omit<SelectNftHookProps, 'formType'>) => {
	const { t } = useTranslation();

	const { mutate, isLoading, isSuccess } = useAddWhitelistWallet();

	const handleSend = ({ data }: HandleSendProps) => {
		const collectionTierNames = tiers.filter((i) => i.totalAmount !== i.maxAmount).map((tier) => tier.id);
		const whitelist: WhitelistAddWalletsTxQueryVariables['whitelist'] = [];

		data.members.forEach((member) => {
			const memberTiers = difference(collectionTierNames, member.tiers).length ? member.tiers : [];

			whitelist.push({ walletAddress: member.walletAddress, email: member.email, tiers: memberTiers });
		});

		mutate(
			{ whitelist, daoAddress },
			{
				onError: (error) => {
					toast.dismiss(whitelistKey(daoId));

					let metamaskErrorMessage = t(`errors.metamask.${(error as MetamaskError).code}`, '');

					toast.error(metamaskErrorMessage || t('toasts.whitelist.failed'), {
						position: 'bottom-center',
						duration: 5000
					});
				}
			}
		);
	};

	return {
		handleSend,
		isLoading,
		isSuccess,
		titleKey: 'toasts.whitelist.loading.title',
		description: t('toasts.whitelist.loading.description')
	};
};
