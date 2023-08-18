// import { Title2 } from 'src/components';
// import { BenefitLabels } from '../benefitLabels';
import { NftDescription } from '../nftDescription';

export type OverviewTabProps = {
	description: string;
};

export const OverviewTab = ({ description }: OverviewTabProps) => {
	// const { t } = useTranslation();

	return (
		<div>
			<NftDescription text={description} />

			{/* Ждет */}
			{/* <Title2 className="mb-3.5">✨ {t('components.nftDetailsTab.overview.benefitsTitle')}</Title2>
			<BenefitLabels /> */}
		</div>
	);
};
