import { OpenseaOutlineIcon } from 'src/components';
import { InfoLabel } from './infoLabel';
import { openExternal } from 'src/utils/urls';

type OpenseaLinkProps = {
	openseaUrl: string;
	className?: string;
	svgHeight?: number;
	svgWeight?: number;
};

export const OpenseaLink = (props: OpenseaLinkProps) => {
	const { openseaUrl, className, svgHeight, svgWeight } = props;

	const handleOpenOpensea = () => openseaUrl && openExternal(openseaUrl);

	return (
		<InfoLabel className={className} onClick={handleOpenOpensea}>
			<OpenseaOutlineIcon width={svgWeight} height={svgHeight} fillOpacity={!openseaUrl ? 0.6 : 1} />
		</InfoLabel>
	);
};
