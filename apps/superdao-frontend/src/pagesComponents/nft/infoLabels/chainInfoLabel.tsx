import { CHAIN_LABEL, ChainLabel } from '../helpers';
import { Label1 } from 'src/components';
import { InfoLabel } from './infoLabel';

type ChainInfoLabelProps = {
	chain: ChainLabel;
};

export const ChainInfoLabel = (props: ChainInfoLabelProps) => {
	const { chain } = props;

	return (
		<InfoLabel>
			{CHAIN_LABEL[chain].icon}
			<Label1>{CHAIN_LABEL[chain].title}</Label1>
		</InfoLabel>
	);
};
