import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { DownloadIcon, Label1 } from 'src/components';
import type { Owners } from 'src/types/types.generated';

type Props = {
	owners: Owners[];
};

export const DownloadOwnersData = (props: Props) => {
	const { owners } = props;
	const { t } = useTranslation();

	const csv = useMemo(() => {
		const rows = [['walletAddress', 'Tier', 'NFT ID']];
		const data = owners.map(({ walletAddress, ens, tokenId, name }) => [ens || walletAddress, name, tokenId]);
		data.forEach(([wallet, tier, id]) => rows.push([wallet, tier, id]));

		return rows;
	}, [owners]);

	return (
		<CSVLink filename="owners" data={csv} enclosingCharacter="">
			<div className="flex items-center whitespace-nowrap">
				<DownloadIcon className="fill-accentPrimary" width={16} height={16} />
				<Label1 className="text-accentPrimary ml-1">{t('components.owners.download')}</Label1>
			</div>
		</CSVLink>
	);
};
