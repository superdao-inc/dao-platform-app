import upperFirst from 'lodash/upperFirst';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { TFunction } from 'next-i18next';

import { getNftTypeData, UNLIMITED_MAX_AMOUNT_VALUE } from 'src/constants';
import { SelectNftProps } from './types';
import { ArtworkView } from 'src/components/artwork';

import { colors, borders } from 'src/style';
import { SelectNftTiersType } from 'src/pagesComponents/membersImport/members/hooks/types';
import { Label1 } from 'src/components';

export const getSelectTiersMapper =
	({ t }: { t: TFunction }) =>
	(tier: SelectNftTiersType): SelectNftProps => {
		const { id, tierName, maxAmount, artworks, totalAmount, isDisabled, tierArtworkType } = tier;
		const media = <StyledArtworkView showCustomControls={false} artworks={artworks} />;
		const { TierArtworkTypeIcon } = getNftTypeData(tierArtworkType);

		return {
			value: id || '',
			labelElement: (
				<TierBlock>
					<div className="mr-2">{TierArtworkTypeIcon && <TierArtworkTypeIcon fill={colors.foregroundTertiary} />}</div>
					<Label1 css={tierNameStyles}>{upperFirst(tierName || id)}</Label1>
				</TierBlock>
			),
			label: upperFirst(tierName || id),
			description:
				maxAmount === UNLIMITED_MAX_AMOUNT_VALUE
					? 'unlimited units'
					: t('components.nft.unitsWithCount', { count: maxAmount - totalAmount }),
			icon: media ?? null,
			isDisabled: isDisabled ?? !(maxAmount - totalAmount)
		};
	};

const StyledArtworkView = styled(ArtworkView)`
	width: 40px;
	height: 40px;
	border-radius: ${borders.small};
`;

const TierBlock = styled.div`
	display: flex;
	align-items: center;
	justify-content: start;
`;

const tierNameStyles = css`
	font-weight: inherit;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin: 0;
	font-size: 16px;
`;
