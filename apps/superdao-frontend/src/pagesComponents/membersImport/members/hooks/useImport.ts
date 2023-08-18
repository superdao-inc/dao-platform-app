import { useCallback, useEffect, useMemo, useState } from 'react';
import uniqWith from 'lodash/uniqWith';
import groupBy from 'lodash/groupBy';

import { AirdropParticipantType } from '../../types';
import { ImportHookTypeProps, ImportHookProps, ReturnedImportTypeProps, SelectNftTiersType } from './types';
import { useImportWhitelist } from './useImportWhitelist';
import { FormType, getSelectTiersMapper, usePrepareSelectTiersOption } from 'src/pagesComponents/dao/nftSelect';
import { useImportAirdrop } from './useImportAirdrop';

const useImportType = ({
	formType,
	...props
}: ImportHookTypeProps & Pick<ImportHookProps, 'formType'>): ReturnedImportTypeProps => {
	const whitelist = useImportWhitelist(props);
	const airdrop = useImportAirdrop(props);

	return formType === FormType.airdrop ? airdrop : whitelist;
};

const getValueByMode = (obj: AirdropParticipantType) => {
	return (obj.walletAddress && obj.walletAddress.toLowerCase()) || obj.email;
};

export const useImport = ({ csvParticipants, formType, daoId, daoAddress, tiers, onBack }: ImportHookProps) => {
	const [participants, setParticipants] = useState(csvParticipants || []);
	const [participantsByTier, setParticipantsByTier] = useState<Record<string, AirdropParticipantType[]>>({});
	const [errors, setErrors] = useState<Record<string, boolean>>({});

	const totalCount = participants.length;
	const uniqueParticipants = useMemo(
		() =>
			uniqWith(participants, (a, b) => {
				const aByMode = getValueByMode(a);
				const bByMode = getValueByMode(b);

				return aByMode === bByMode && a.tier === b.tier;
			}),
		[participants]
	);
	const uniqueCount = uniqueParticipants.length;

	const groups = useMemo(() => groupBy(participants, 'tier'), [participants]);
	const { hasError, filteredOptions, ...props } = useImportType({
		formType,
		errors,
		groups,
		participantsByTier,
		daoId,
		daoAddress,
		tiers,
		participants,
		setParticipantsByTier,
		onBack
	});

	const options = usePrepareSelectTiersOption<SelectNftTiersType>({
		options: filteredOptions ?? [],
		optionsMapper: getSelectTiersMapper
	});

	/**
	 * Вот это надо проверить на правильность валидирования кнопки 200%
	 * isValidSupply вроде больше не нужен по причине валидирования во время выбора тира в модалке
	 */
	const hasFilled = Object.values(participantsByTier).some(({ length }) => length > 0);

	const canSend = hasFilled && !hasError;

	const handleSetError = useCallback((csvTierName: string, isError: boolean) => {
		setErrors((state) => {
			return {
				...state,
				[csvTierName]: isError
			};
		});
	}, []);

	useEffect(() => {
		setParticipantsByTier({});
	}, [participants]);

	return {
		...props,
		totalCount,
		uniqueCount,
		canSend,
		groups,
		participants,
		participantsByTier,
		options,
		setParticipants,
		handleSetError
	};
};
