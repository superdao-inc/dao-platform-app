import { useTranslation } from 'next-i18next';
import { css } from '@emotion/react';
import cn from 'classnames';
import { colors } from 'src/style';
import { Caption, Label2 } from 'src/components';

const emptyImg = '/assets/unknown-asset.png';

type TextTagType = 'Caption' | 'Label';

type Props = {
	assets: (string | null)[];
	showAssetsNumberLimit: number;
	textTagType: TextTagType;
	enableBackground: boolean;
	addPaddings: boolean;
};

type Color = keyof typeof colors;

const displayTypeToSetting: {
	[key in TextTagType]: { tag: typeof Label2 | typeof Caption; color: typeof colors[Color] };
} = {
	Caption: {
		tag: Caption,
		color: colors.foregroundTertiary
	},
	Label: {
		tag: Label2,
		color: colors.foregroundPrimary
	}
};

export const TopAssetsListInTreasury = (props: Props) => {
	const { assets, showAssetsNumberLimit, enableBackground, addPaddings, textTagType } = props;

	const TextTag = displayTypeToSetting[textTagType].tag;
	const textTagColor = displayTypeToSetting[textTagType].color;

	const { t } = useTranslation();

	return (
		<div
			className={cn(
				'flex h-6 h-full items-center rounded-lg',
				enableBackground && 'bg-overlaySecondary',
				addPaddings && 'px-3'
			)}
		>
			<div className="mr-2 flex">
				{assets.slice(0, showAssetsNumberLimit).map((asset) => (
					<div
						className="relative mr-[-5px] h-5 w-5 rounded-full bg-contain bg-center bg-no-repeat last:mr-0"
						key={asset}
						css={css({
							backgroundImage: `url(${asset || emptyImg})`,
							border: `1px solid ${colors.backgroundTertiary}`
						})}
					/>
				))}
			</div>

			<TextTag color={textTagColor}>{t('components.treasury.assetsCount', { count: assets.length })}</TextTag>
		</div>
	);
};
