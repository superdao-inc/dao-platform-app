import { useTranslation } from 'next-i18next';
import { Caption, Label1, Loader } from 'src/components';
import { colors } from 'src/style';

type Props = {
	name: string;
};

export const CompressingArtwork = (props: Props) => {
	const { name } = props;
	const { t } = useTranslation();

	return (
		<div className={'mb-5 flex min-h-[84px] w-full items-start'}>
			<div className="bg-backgroundTertiary relative h-[84px] w-[84px] overflow-hidden rounded-lg">
				<div className="flex h-full w-full items-center justify-center">
					<Loader size="xl" color={colors.accentPrimary} />
				</div>
			</div>
			<div className="max-w-[352px] flex-1 px-5">
				<div className="mb-1 w-full truncate">
					<Label1 className="truncate">{name}</Label1>
				</div>
				<Caption className="text-foregroundSecondary">{t('modals.selfServiceTier.preview.compressing')}</Caption>
			</div>
			<div className="flex min-w-[76px] items-center justify-end">
				{/* {onRemoveArtwork && (
					<ControlContainer
						className="!bg-overlaySecondary ml-1 h-8 w-8 rounded-lg"
						onClick={() => onRemoveArtwork(artworkIndex)}
					>
						<TrashIcon className="h-5 w-5" fill={colors.accentNegative} />
					</ControlContainer>
				)} */}
			</div>
		</div>
	);
};
