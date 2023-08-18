import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { colors } from 'src/style';
import { MultiTypeNftAttribute } from 'src/types/types.generated';
import { TooltipContent } from '../navigation/tooltipContent';
import { Detail, Label2 } from '../text';
import Tooltip from '../tooltip';

enum BenefitType {
	special = 'special',
	default = 'default'
}

type BenefitLabelProps = {
	benefit: MultiTypeNftAttribute;
	type: string;
};

const BenefitLabel = ({ benefit, type }: BenefitLabelProps) => {
	const textContent = benefit.valueString || '';
	let textRender = <>{textContent}</>;

	if ((textContent?.length || 0) > 23) {
		textRender = (
			<Tooltip content={<TooltipContent title={textContent} />} placement="top">
				{benefit.valueString}
			</Tooltip>
		);
	}

	return (
		<div
			className={cn('rounded-lg px-3 py-1.5', {
				'bg-overlayTintCyan': type === BenefitType.special,
				'bg-overlayModal': type === BenefitType.default
			})}
		>
			<Label2
				className={cn('line-clamp-1 overflow-hidden text-ellipsis', {
					'text-tintCyan': type === BenefitType.special,
					'text-foregroundPrimary': type === BenefitType.default
				})}
			>
				{textRender}
			</Label2>
		</div>
	);
};

export type NftCardAttributesProps = {
	benefits: MultiTypeNftAttribute[];
	customProperties: MultiTypeNftAttribute[];
	className?: string;
};

const Points = ({ amount, className }: { amount: number; className?: string }) => (
	<div className={cn('bg-tintCyan flex h-4 w-4 items-center justify-center rounded-full', className)}>
		<Detail>{amount}</Detail>
	</div>
);

export const NftCardAttributes = (props: NftCardAttributesProps) => {
	const { benefits, customProperties, className } = props;

	const { t } = useTranslation();

	const hasBenefits = benefits.length > 0;

	return (
		<div className={cn('relative mt-3 pt-3', className)}>
			<div className={'bg-backgroundTertiary absolute -left-4 top-0 -right-4 h-[1px]'}></div>

			{hasBenefits && (
				<>
					<Detail color={colors.foregroundTertiary}>{t('components.nftCard.benefits.title')}</Detail>

					<div className="mt-2.5 flex flex-wrap gap-3">
						{benefits.map((benefit) => (
							<BenefitLabel type={BenefitType.special} key={benefit.valueString} benefit={benefit} />
						))}
					</div>
				</>
			)}

			{customProperties.length > 0 && (
				<div className={cn('flex items-center', hasBenefits && 'mt-4')}>
					<Points amount={customProperties.length} className="mr-1.5" />
					<Detail color={colors.foregroundTertiary}>{t('components.nftCard.benefits.subtitle')}</Detail>
				</div>
			)}
		</div>
	);
};
