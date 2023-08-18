import { getNftTypeData } from 'src/constants';
import { CollectionTierInfo } from 'src/types/types.generated';
import { colors } from 'src/style';
import { Label1 } from 'src/components';
import { InfoLabel } from './infoLabel';

type TierTypeInfoLabelProps = {
	tierArtworkType: CollectionTierInfo['tierArtworkType'];
};

/**
 * @depreecated
 */
export const TierTypeInfoLabel = (props: TierTypeInfoLabelProps) => {
	const { tierArtworkType } = props;

	const { TierArtworkTypeIcon, ...tierType } = getNftTypeData(tierArtworkType, false);

	return (
		<InfoLabel>
			{TierArtworkTypeIcon && <TierArtworkTypeIcon fill={colors.foregroundTertiary} />}
			<Label1>{tierType.title}</Label1>
		</InfoLabel>
	);
};
