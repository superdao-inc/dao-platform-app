import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { AirdropParticipantType } from 'src/pagesComponents/membersImport/types';
import {
	IMPORT_CSV_AIRDROP_SEARCH_PARAM,
	IMPORT_CSV_WHITELIST_SEARCH_PARAM,
	MANUAL_WHITELIST_SEARCH_PARAM
} from 'src/constants';
import { useSwitch } from 'src/hooks/use-switch';

export enum EInterlayerAction {
	MANUAL = 'MANUAL',
	IMPORT = 'IMPORT'
}

export enum EInterlayerType {
	WHITELIST = 'WHITELIST',
	AIRDROP = 'AIRDROP'
}

const CSV_AIRDROP_DATA_KEY = 'csvAirdropData';

type CsvAirdropData = {
	csvFilename: string;
	csvParticipants: AirdropParticipantType[];
};

type Args = {
	slug: string;
};

export const useInterlayerUploadModal = ({ slug: _slug }: Args) => {
	const { push, query } = useRouter();

	const { slug } = query;

	const queryClient = useQueryClient();

	const handleCsvSubmit = useCallback(
		(csvFilename: string, csvParticipants: AirdropParticipantType[], isWhitelist: boolean | undefined = false) => {
			queryClient.setQueryData<CsvAirdropData>(CSV_AIRDROP_DATA_KEY, {
				csvFilename,
				csvParticipants
			});
			push(`/${slug}/members?${isWhitelist ? IMPORT_CSV_WHITELIST_SEARCH_PARAM : IMPORT_CSV_AIRDROP_SEARCH_PARAM}=1`);
		},
		[push, slug, queryClient]
	);

	const [isUploadModalOpen, { toggle: toggleUploadModal, off: closeUploadModal }] = useSwitch(false);

	const [isUploadWhitelistModalOpen, { toggle: toggleWhitelistUploadModal, off: closeWhitelistUploadModal }] =
		useSwitch(false);

	const [isUploadInterlayerModalOpen, { toggle: toggleInterlayerUploadModal }] = useSwitch(false);

	const [isUploadWhitelistInterlayerModalOpen, { toggle: toggleWhitelistInterlayerUploadModal }] = useSwitch(false);

	const handleSubmitUploadModal = useCallback(
		(csvFilename: string, csvParticipants: AirdropParticipantType[]) => {
			closeUploadModal();
			handleCsvSubmit(csvFilename, csvParticipants);
		},
		[handleCsvSubmit, closeUploadModal]
	);

	const handleSubmitWhitelistUploadModal = useCallback(
		(csvFilename: string, csvParticipants: AirdropParticipantType[]) => {
			closeWhitelistUploadModal();
			handleCsvSubmit(csvFilename, csvParticipants, true);
		},
		[handleCsvSubmit, closeWhitelistUploadModal]
	);

	const whitelistHandlers = useMemo(
		() => ({
			[EInterlayerAction.IMPORT]: () => {
				toggleWhitelistInterlayerUploadModal();
				toggleWhitelistUploadModal();
			},
			[EInterlayerAction.MANUAL]: () => {
				toggleWhitelistInterlayerUploadModal();
				push(`/${slug}/members/manual?${MANUAL_WHITELIST_SEARCH_PARAM}=1`).finally();
			}
		}),
		[slug, push, toggleWhitelistInterlayerUploadModal, toggleWhitelistUploadModal]
	);

	const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);

	const airdropHandlers = useMemo(
		() => ({
			[EInterlayerAction.IMPORT]: () => {
				toggleInterlayerUploadModal();
				toggleUploadModal();
			},
			[EInterlayerAction.MANUAL]: () => {
				const _redirectUrl = redirectUrl ?? `/${slug}/members/manual`;
				toggleInterlayerUploadModal();
				push(_redirectUrl).finally();
			}
		}),
		[toggleInterlayerUploadModal, toggleUploadModal, redirectUrl, slug, push]
	);

	const withHandleInterlayerSelect = useCallback(
		(action: EInterlayerAction, type: EInterlayerType) => {
			if (type === EInterlayerType.WHITELIST) {
				const handler = whitelistHandlers[action];

				return handler;
			}

			if (type === EInterlayerType.AIRDROP) {
				const handler = airdropHandlers[action];

				return handler;
			}

			return () => {};
		},
		[airdropHandlers, whitelistHandlers]
	);

	const csvAirdropData = queryClient.getQueryData<CsvAirdropData>(CSV_AIRDROP_DATA_KEY);

	return useMemo(
		() => ({
			isUploadModalOpen,
			isUploadWhitelistModalOpen,
			isUploadInterlayerModalOpen,
			isUploadWhitelistInterlayerModalOpen,
			handleSubmitUploadModal,
			handleSubmitWhitelistUploadModal,
			withHandleInterlayerSelect,
			toggleWhitelistInterlayerUploadModal,
			toggleInterlayerUploadModal,
			toggleWhitelistUploadModal,
			toggleUploadModal,
			closeUploadModal,
			closeWhitelistUploadModal,
			csvFilename: csvAirdropData?.csvFilename,
			csvParticipants: csvAirdropData?.csvParticipants,
			setRedirectUrl
		}),
		[
			isUploadModalOpen,
			isUploadWhitelistModalOpen,
			isUploadInterlayerModalOpen,
			isUploadWhitelistInterlayerModalOpen,
			handleSubmitUploadModal,
			handleSubmitWhitelistUploadModal,
			withHandleInterlayerSelect,
			toggleWhitelistInterlayerUploadModal,
			toggleInterlayerUploadModal,
			toggleWhitelistUploadModal,
			toggleUploadModal,
			closeUploadModal,
			closeWhitelistUploadModal,
			csvAirdropData,
			setRedirectUrl
		]
	);
};
