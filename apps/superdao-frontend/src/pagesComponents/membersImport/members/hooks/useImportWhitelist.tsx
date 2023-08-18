import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import difference from 'lodash/difference';

import { WhitelistParticipantType } from '../../types';
import { ImportHookTypeProps, SelectNftTiersType, ParticipantsAccumulatorType } from './types';

import { toast, NftToastContent } from 'src/components';
import { whitelistKey } from 'src/utils/toastKeys';
import { useAddWhitelistWallet } from 'src/hooks';
import { WhitelistAddWalletsTxQueryVariables } from 'src/gql/transaction.generated';

import { MetamaskError } from 'src/types/metamask';

export const useImportWhitelist = ({
	participantsByTier,
	groups,
	daoId,
	daoAddress,
	tiers,
	participants,
	setParticipantsByTier,
	onBack
}: ImportHookTypeProps) => {
	const { t } = useTranslation();
	const { mutate: sendWhitelist } = useAddWhitelistWallet();

	const selectedTiersWalletsSize = useMemo(() => {
		return Object.keys(participantsByTier).reduce((walletsLength, tierKey) => {
			const tierSelected = !!participantsByTier[tierKey]?.length;
			/**
			 * When tiers in csv are different than tiers in contract,
			 * we don't have contract tiers in group and we need use ?? operator.
			 */
			const csvTierWalletsLength = tierSelected ? groups[tierKey]?.length ?? 1 : 0;

			return walletsLength + csvTierWalletsLength;
		}, 0);
	}, [groups, participantsByTier]);

	const handleSelect = useCallback(
		(csvTierNameUnknownCase: string) => (newWhitelistTierNamesUnknownCases: string[]) => {
			const csvTierName = csvTierNameUnknownCase;
			const newWhitelistTierNames = newWhitelistTierNamesUnknownCases?.map((tierName) => tierName);

			setParticipantsByTier((currentState) => {
				const newState = { ...currentState };

				newState[csvTierName] = [];

				newWhitelistTierNames.forEach((tierName) => {
					const newParticipants = participants
						.filter((participant) => participant.tier === csvTierName)
						.map((participant) => ({ ...participant, tier: tierName }));
					newState[csvTierName] = [...newState[csvTierName], ...newParticipants];
				});

				return newState;
			});
		},
		[participants, setParticipantsByTier]
	);

	const handleSend = () => {
		const toastKey = whitelistKey(daoId);
		const whitelist = Object.entries(participantsByTier).reduce<WhitelistParticipantType[]>((acc, [_, value]) => {
			return [
				...acc,
				...value.map((participant) => ({
					...participant,
					email: participant.email.replace(/(\r\n|\n|\r)/gm, '')
				}))
			];
		}, []);

		const participantsAccumulator = whitelist.reduce((acc: ParticipantsAccumulatorType, value) => {
			const currentAccItem = acc[value.walletAddress];

			if (!currentAccItem) {
				acc[value.walletAddress] = {
					...value,
					tier: [value.tier]
				};

				return acc;
			}

			acc[value.walletAddress] = {
				...currentAccItem,
				tier: [...currentAccItem.tier, value.tier]
			};

			return acc;
		}, {});

		const collectionTierNames = tiers?.filter((i) => i.totalAmount !== i.maxAmount).map((tier) => tier.id);

		const structuredWhitelist: WhitelistAddWalletsTxQueryVariables['whitelist'] = Object.values(
			participantsAccumulator
		).map((member) => {
			const whitelistTiers = Array.isArray(member.tier) ? member.tier : member.tier.split(' ');

			const memberTiers = difference(collectionTierNames, whitelistTiers).length ? whitelistTiers : [];

			return { walletAddress: member.walletAddress, email: member.email, tiers: memberTiers };
		});

		toast.loading(
			<NftToastContent
				title={t('toasts.whitelist.loading.title', {
					count: structuredWhitelist.length
				})}
				description={t('toasts.whitelist.loading.description')}
			/>,
			{
				position: 'bottom-center',
				id: toastKey
			}
		);

		sendWhitelist(
			{ whitelist: structuredWhitelist, daoAddress },

			{
				onSuccess: onBack,
				onError: (error) => {
					toast.dismiss(toastKey);
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
		hasError: false,
		isLoading: false,
		filteredOptions: tiers as SelectNftTiersType[] | undefined,
		selectedTiersWalletsSize,
		handleSelect,
		handleSend
	};
};
