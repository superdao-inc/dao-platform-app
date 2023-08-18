import { PolygonScanIcon } from 'src/components/assets/icons/networks/polygonScan';

export const CHAIN_LABEL = {
	polygon: {
		icon: <PolygonScanIcon />,
		title: 'Polygon'
	}
};

export type ChainLabel = keyof typeof CHAIN_LABEL;
