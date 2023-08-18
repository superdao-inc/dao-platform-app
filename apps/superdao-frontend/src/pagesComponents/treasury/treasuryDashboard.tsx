import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { TopAssetsListInTreasury } from './topAssetsListInTreasury';
import { SubHeading, Title1 } from 'src/components';
import { colors } from 'src/style';
import { formatUsdValue } from 'src/utils/formattes';
import { SkeletonDashboard } from './skeletonDashboard';
import { MobileSkeletonDashboard } from 'src/pagesComponents/treasury/mobileSkeletons/skeletonDashboard';

type Props = {
	valueUsd: number;
	contractAddress: string | null;
	assets: (string | null)[];
	isLoading: boolean;
	isMobile: boolean;
};

export const TreasuryDashboard = (props: Props) => {
	const { valueUsd, contractAddress, assets, isLoading, isMobile } = props;
	const hasAssets = !!assets.length;
	const showBottom = hasAssets || contractAddress;

	const { t } = useTranslation();
	const splittedValue = formatUsdValue(valueUsd).split('.');

	const SkeletonComponent = () => (isMobile ? <MobileSkeletonDashboard /> : <SkeletonDashboard />);

	return (
		<>
			{isLoading ? (
				<SkeletonComponent />
			) : isMobile ? (
				<div
					className={cn('bg-backgroundSecondary mb-0	flex flex-col rounded-lg px-6 py-5', valueUsd && 'rounded-b-none')}
					data-testid={'TreasuryDashboard__balanceWrapper'}
				>
					<div className="animate-[fadeIn_1s_ease-in]">
						<Title1 className="mb-1" data-testid={'TreasuryDashboard__balanceTotal'}>
							{`$${splittedValue[0]}`}
							{splittedValue[1] && (
								<Title1 className="inline" color={colors.foregroundTertiary}>{`.${splittedValue[1]}`}</Title1>
							)}
						</Title1>
						<SubHeading color={colors.foregroundTertiary} data-testid={'TreasuryDashboard__balanceSubheading'}>
							{t('components.treasury.totalFunds')}
						</SubHeading>
					</div>
				</div>
			) : (
				<div
					className="bg-backgroundSecondary mb-4	flex flex-col rounded-lg px-6 py-5"
					data-testid={'TreasuryDashboard__balanceWrapper'}
				>
					<div className="animate-[fadeIn_1s_ease-in]">
						<Title1 className="mb-1" data-testid={'TreasuryDashboard__balanceTotal'}>{`${formatUsdValue(
							valueUsd
						)} USD`}</Title1>
						<SubHeading color={colors.foregroundTertiary} data-testid={'TreasuryDashboard__balanceSubheading'}>
							{t('components.treasury.totalFunds')}
						</SubHeading>

						{showBottom && (
							<div className="mt-2.5 flex h-8">
								{hasAssets && (
									<div className="mr-2 flex items-center" data-testid={'TreasuryDashboard__balanceAssets'}>
										<TopAssetsListInTreasury
											assets={assets}
											enableBackground
											addPaddings
											textTagType="Label"
											showAssetsNumberLimit={5}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};
