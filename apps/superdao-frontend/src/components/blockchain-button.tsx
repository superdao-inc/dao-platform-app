import { useCheckChain } from 'src/hooks/useCheckChain';

import { Button } from './button';

type Props = Parameters<typeof Button>[0];

export const BlockchainButton = (props: Props) => {
	const { disabled } = props;
	const { isWrongChain } = useCheckChain();

	return <Button {...props} disabled={disabled || isWrongChain} />;
};
