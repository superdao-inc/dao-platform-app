import { Dispatch, SetStateAction } from 'react';

import { AirdropParticipantType } from '../../types';

import { FormType } from 'src/pagesComponents/dao/nftSelect';
import { NftTier } from 'src/types/types.generated';

export type ParticipantsByTierType = Record<string, AirdropParticipantType[]>;

export type SelectNftTiersType = NftTier & { isDisabled?: boolean };

export type ImportHookProps = {
	csvParticipants?: AirdropParticipantType[];
	formType: FormType;
	daoId: string;
	daoAddress: string;
	tiers: NftTier[];
	onBack?: () => void;
};

export type ImportHookTypeProps = {
	participantsByTier: ParticipantsByTierType;
	participants: AirdropParticipantType[];
	groups: Record<string, AirdropParticipantType[]>;
	daoId: string;
	daoAddress: string;
	errors?: Record<string, boolean>;
	tiers?: NftTier[];
	setParticipantsByTier: Dispatch<SetStateAction<Record<string, AirdropParticipantType[]>>>;
	onBack?: () => void;
};

export type ReturnedImportTypeProps = {
	hasError: boolean;
	selectedTiersWalletsSize: number;
	isLoading: boolean;
	filteredOptions?: SelectNftTiersType[];
	handleSend: () => void;
	handleSelect: (name: string) => (...props: any[]) => void;
};

export type ParticipantsAccumulatorType = {
	[key: string]: Omit<AirdropParticipantType, 'tier'> & { tier: string | string[] };
};
