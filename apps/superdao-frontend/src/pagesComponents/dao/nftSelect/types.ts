import { ForwardedRef, ReactNode } from 'react';
import { ControllerRenderProps, Path, UseFormTrigger } from 'react-hook-form';
import { GroupBase, MenuPlacement, StylesConfig } from 'react-select';
import { SelectComponents } from 'react-select/dist/declarations/src/components';
import { DefaultSelectProps } from 'src/components';
import { NftTier } from 'src/types/types.generated';

export enum FormType {
	whitelist,
	airdrop
}

type FormDetails = {
	walletAddress: string;
	tiers: string[];
	email: string;
};

export type ManualFormProps = {
	members: FormDetails[];
};

type CommonSelectProps = {
	maxMenuHeight?: number;
	allOption?: SelectNftProps;
	allowSelectAll?: boolean;
	menuPlacement?: MenuPlacement;
};

export type SelectManualProps<T = ControllerRenderProps<ManualFormProps, Path<ManualFormProps>>> = {
	formType: FormType;
	options: SelectNftProps[];
	isLoading: boolean;
	ref?: ForwardedRef<HTMLDivElement>;
	styles?: StylesConfig<SelectNftProps, boolean, GroupBase<SelectNftProps>>;
	components?: Partial<SelectComponents<SelectNftProps, boolean, GroupBase<SelectNftProps>>>;
	trigger?: UseFormTrigger<ManualFormProps>;
} & T &
	CommonSelectProps;

export type SelectImportProps = SelectManualProps<
	{
		onChange: (value: string[]) => void;
		value: string;
		name: string;
	} & CommonSelectProps
>;

export type SelectNftHookProps = {
	formType: FormType;
	options: SelectNftProps[];
	tiers: NftTier[];
	daoAddress: string;
	daoId: string;
};

export type HandleSendProps = {
	data: ManualFormProps;
};

export type ReturnedSelectNftHookProps = {
	handleSend: (props: HandleSendProps) => void;
	isLoading: boolean;
	isSuccess: boolean;
	titleKey: string;
	description: string;
};

export type SelectNftFieldProps = { isManual?: boolean; isError?: boolean } & (SelectManualProps | SelectImportProps);

export type SelectNftProps = DefaultSelectProps & { labelElement?: ReactNode };
