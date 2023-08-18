import { ComponentProps } from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { Button, Headline, Label1, Title3 } from 'src/components';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import Tooltip from 'src/components/tooltip';
import { useChain } from 'src/hooks/useChain';
import { TierSaleStatus } from 'src/constants/tierSaleStatus';
import { Chain, networkMap } from '@sd/superdao-shared';

type PriceAmount = {
	amount: string | number;
	currency: string;
};

type Props = {
	isAuthorized: boolean;
	btnAction: () => void;
	isLoading: boolean;
	isButtonLoading: boolean;
	chainId: Chain;
	tokenPrice: PriceAmount;
	fiatPrice: PriceAmount;
	status: TierSaleStatus;
};

type ActionButton = ComponentProps<typeof Button> & {
	tooltipContent: ComponentProps<typeof Tooltip>['content'];
};

/**
 * Кнопка с опциональной подсказкой в тултипе.
 */
const ActionButton: React.FC<ActionButton> = (props) => {
	const { tooltipContent, ...buttonProps } = props;

	return tooltipContent ? (
		<Tooltip content={tooltipContent} placement="bottom">
			{/* Хак, чтобы обойти багу в Реакте https://github.com/facebook/react/issues/19419 */}
			<div style={{ padding: 8, margin: -8 }}>
				<Button {...buttonProps} />
			</div>
		</Tooltip>
	) : (
		<Button {...buttonProps} />
	);
};

export const DetailsAction = (props: Props) => {
	const { isAuthorized, isLoading, chainId, isButtonLoading, tokenPrice, fiatPrice, btnAction, status } = props;
	const { t } = useTranslation();

	const { chainId: currentChainId } = useChain();
	const hasWrongChainIdToBuy = currentChainId !== chainId;
	const chainProps = networkMap[chainId];

	const isBtnDisabled =
		isAuthorized &&
		hasWrongChainIdToBuy &&
		(status === TierSaleStatus.OPEN_SALE || status === TierSaleStatus.PRIVATE_SALE);

	const btnTextByStatus = {
		[TierSaleStatus.NOT_IN_WHITELIST]: t('components.buyNft.btnTextNotEligible'),
		[TierSaleStatus.OPEN_SALE]: t('components.buyNft.buyNowBtn'),
		[TierSaleStatus.PRIVATE_SALE]: t('components.buyNft.buyNowBtn'),
		[TierSaleStatus.AUTHORIZATION]: t('actions.labels.signIn'),
		[TierSaleStatus.CLAIM]: 'Claim NFT',
		[TierSaleStatus.NOT_AVAILABLE]: t('actions.labels.viewOpensea')
	};

	const tooltipContent = t(`components.buyNft.btnTooltipTextWrongChain`, { chainName: chainProps.name });
	const showToltipContent =
		isAuthorized &&
		hasWrongChainIdToBuy &&
		(status === TierSaleStatus.OPEN_SALE || status === TierSaleStatus.PRIVATE_SALE);

	if (status === TierSaleStatus.EMPTY) {
		return null;
	}

	return (
		<div className="bg-backgroundTertiary relative mt-4 overflow-hidden rounded-[10px] p-4">
			{(status === TierSaleStatus.NOT_IN_WHITELIST || status === TierSaleStatus.AUTHORIZATION) && (
				<img
					className="absolute top-0 right-0 bottom-0 left-0 z-0 h-full w-full object-cover"
					src="/assets/eligible.png"
				/>
			)}

			{isLoading ? (
				<div className="flex w-full flex-col gap-1.5">
					<SkeletonComponent className="rounded" width="80%" height={16} />
					<SkeletonComponent className="rounded" width="90%" height={16} />
				</div>
			) : (
				<div className="z-1 relative">
					<div className="flex items-baseline justify-between sm:block">
						{status === TierSaleStatus.NOT_AVAILABLE && <Title3>{t('components.nft.notAvailable')}</Title3>}
						{status === TierSaleStatus.AUTHORIZATION && (
							<Headline className="w-[180px]">{t('components.buyNft.signInForClaim')}</Headline>
						)}
						{status === TierSaleStatus.NOT_IN_WHITELIST && (
							<Label1>{t('components.buyNft.notEligibleMessage.title')}</Label1>
						)}

						{(status === TierSaleStatus.OPEN_SALE || status === TierSaleStatus.PRIVATE_SALE) && (
							<>
								<Label1 className="text-foregroundSecondary mb-0 sm:mb-1">
									{status === TierSaleStatus.PRIVATE_SALE
										? t('components.buyNft.priceInWhitelist')
										: t('components.buyNft.price')}
								</Label1>
								<div className="flex flex-row-reverse items-center justify-end sm:block">
									<Title3 className="text-foregroundPrimary">
										{tokenPrice?.amount} {tokenPrice?.currency}
									</Title3>
									<Label1 className="text-foregroundTertiary mr-1 sm:mr-0 sm:mt-1">
										~ {fiatPrice?.currency} {fiatPrice?.amount}
									</Label1>
								</div>
							</>
						)}
					</div>
					<ActionButton
						tooltipContent={showToltipContent ? tooltipContent : undefined}
						isLoading={isButtonLoading}
						disabled={isBtnDisabled}
						onClick={btnAction}
						label={btnTextByStatus[status]}
						className={cn('w-full', { ['mt-4']: status !== TierSaleStatus.CLAIM })}
						color="accentPrimary"
						size="lg"
					/>
				</div>
			)}
		</div>
	);
};
