import { css } from '@emotion/react';
import copy from 'clipboard-copy';
import { useTranslation } from 'next-i18next';
import { Button, Label1, toast } from 'src/components';
import { colors } from 'src/style';
import type { Owners } from 'src/types/types.generated';

type Props = {
	isInside: boolean;
	owners: Owners[];
};

const CopyOwnersAddress = (props: Props) => {
	const { isInside, owners } = props;
	const { t } = useTranslation();

	const allAddress = owners.map(({ walletAddress, ens }) => ens || walletAddress).join(',');

	const handleCopyAllNfts = () =>
		copy(allAddress).then(() =>
			toast(t('actions.confirmations.allNftIdCopy'), { position: 'bottom-center', id: 'nft-ids-copy' })
		);
	return isInside ? (
		<Label1 className="hidden lg:block" css={headerBtnStyles} color={colors.accentPrimary} onClick={handleCopyAllNfts}>
			{t('components.owners.titleBtn')}
		</Label1>
	) : (
		<Button
			className="hidden lg:block"
			color="accentPrimary"
			size="md"
			label={t('components.owners.titleBtn')}
			onClick={handleCopyAllNfts}
		/>
	);
};

const headerBtnStyles = css`
	cursor: pointer;
`;

export default CopyOwnersAddress;
