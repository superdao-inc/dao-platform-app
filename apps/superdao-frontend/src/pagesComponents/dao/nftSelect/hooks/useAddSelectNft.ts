import { SelectNftHookProps, FormType, ReturnedSelectNftHookProps } from '../types';
import { useSelectWhitelist } from './useSelectWhitelist';
import { useSelectAirdrop } from './useSelectAirdrop';

export const useAddSelectNft = ({ formType, ...props }: SelectNftHookProps): ReturnedSelectNftHookProps => {
	const airdrop = useSelectAirdrop(props);
	const whitelist = useSelectWhitelist(props);

	return formType === FormType.airdrop ? airdrop : whitelist;
};
