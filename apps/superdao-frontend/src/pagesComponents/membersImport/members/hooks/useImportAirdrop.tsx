import { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';

import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import { toast, NftToastContent } from 'src/components';
import { airdropKey } from 'src/utils/toastKeys';
import { useAirdropByWallet } from 'src/hooks';
import { useInfiniteGetDaoWhitelistQuery, useWhitelistAddEmailMutation } from 'src/gql/whitelist.generated';
import { MetamaskError } from 'src/types/metamask';
import { AirdropParticipantInput, WhitelistTargetsEnum } from 'src/types/types.generated';

import { ImportHookTypeProps, SelectNftTiersType } from './types';

export const useImportAirdrop = ({
	participantsByTier,
	errors,
	daoId,
	daoAddress,
	tiers,
	groups,
	setParticipantsByTier
}: ImportHookTypeProps) => {
	const { t } = useTranslation();

	const { push, query } = useRouter();
	const queryClient = useQueryClient();

	const { mutate, isLoading, isSuccess } = useAirdropByWallet();

	const {
		mutate: mutationAddByEmail,
		isLoading: isLoadingAddByEmail,
		isSuccess: isSuccessAddByEmail
	} = useWhitelistAddEmailMutation();

	const selectedTiersWalletsSize = useMemo(
		() => Object.values(participantsByTier).reduce((size, tier) => size + tier.length, 0),
		[participantsByTier]
	);

	const hasError = (errors && !!Object.values(errors).reduce((acc, state) => acc + +state, 0)) || false;

	/**
	 * return tiers with disabled property for airdrop
	 * error validation for case, when we selected tier more than we have tier amount.
	 */
	const filteredOptions: SelectNftTiersType[] | undefined = useMemo(
		() =>
			tiers?.map((tier) => {
				const currentTier = participantsByTier?.[tier?.id];

				const isLessThanSelected = tier.maxAmount - tier.totalAmount <= (currentTier?.length ?? 0);

				return {
					...tier,
					isDisabled: isLessThanSelected
				};
			}),
		[tiers, participantsByTier]
	);

	const handleSelect = useCallback(
		(csvTierNameUnknownCase: string) => (prevTierNameUnknownCase?: string, tierNameUnknownCase?: string) => {
			const csvTierName = csvTierNameUnknownCase;
			const prevTierName = prevTierNameUnknownCase;
			const tierName = tierNameUnknownCase;

			setParticipantsByTier((currentState) => {
				const newState = { ...currentState };

				if (prevTierName) {
					newState[prevTierName] = (currentState[prevTierName] || []).filter((item) => {
						return item.tier !== csvTierName;
					});
				}

				if (tierName) {
					const oldParticipants = currentState[tierName] || [];
					newState[tierName] = [...oldParticipants, ...groups[csvTierName]];
				}

				return newState;
			});
		},
		[groups, setParticipantsByTier]
	);

	const handleSend = () => {
		const toastKey = airdropKey(daoId);
		const airdropParticipants = Object.entries(participantsByTier).reduce<AirdropParticipantInput[]>(
			(acc, [tier, value]) => {
				return [
					...acc,
					...value.map((participant) => ({
						walletAddress: participant.walletAddress,
						tiers: [tier],
						email: participant.email.replace(/(\r\n|\n|\r)/gm, '')
					}))
				];
			},
			[]
		);

		const byEmailAirdrop = airdropParticipants.filter((member) => !member.walletAddress && member.email);
		const byWalletAirdrop = airdropParticipants.filter((member) => member.walletAddress);

		toast.loading(
			<NftToastContent
				title={t('toasts.airdrop.loading.title', {
					count: airdropParticipants.length
				})}
				description={t('toasts.airdrop.loading.description')}
			/>,
			{
				position: 'bottom-center',
				id: toastKey
			}
		);

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
						//Если у нас нет аирдропа по емейлу, тостами управляем руками, не через rabbit
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
					// here we pass unsorted ones so that there is a correct count in the toast by email + address
					items: airdropParticipants
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
		hasError,
		isLoading: isLoading || isLoadingAddByEmail,
		isSuccess: isSuccess || isSuccessAddByEmail,
		filteredOptions,
		selectedTiersWalletsSize,
		handleSelect,
		handleSend
	};
};
