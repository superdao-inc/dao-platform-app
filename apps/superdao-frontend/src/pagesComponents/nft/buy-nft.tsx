import { ComponentProps, useMemo } from 'react';
import { useTranslation } from 'next-i18next';

import { Label1, SubHeading } from 'src/components/text';
import { Button } from 'src/components/button';
import { colors } from 'src/style';
import { ExclamationMarkIcon } from 'src/components/assets/icons/ExclamationMarkIcon';
import { CollectionTierInfo } from 'src/types/types.generated';
import { AuthAPI } from 'src/features/auth/API';
import { useChain } from 'src/hooks/useChain';
import { Chain, networkMap } from '@sd/superdao-shared';
import Tooltip from 'src/components/tooltip';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

type BuyNftButton = ComponentProps<typeof Button> & {
	tooltipContent: ComponentProps<typeof Tooltip>['content'];
};

/**
 * Кнопка покупки NFT с опциональной подсказкой в тултипе.
 */
const BuyNftButton: React.FC<BuyNftButton> = (props) => {
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

type BuyNftProps = {
	isWhitelistSaleAndUserUnverified: boolean;
	hasEnoughUnitsToBuy: boolean;
	isAvailable?: boolean;
	price: string | number;
	currency: string;
	btnAction: () => void;
	isActive: boolean;
	isLoading: boolean;
	isButtonLoading: boolean;
	tierArtworkType: CollectionTierInfo['tierArtworkType'];
	chainId: Chain;
};

/**
 * @deprecated
 */
export const BuyNft: React.VFC<BuyNftProps> = (props) => {
	const {
		isAvailable = true,
		price,
		currency,
		isWhitelistSaleAndUserUnverified,
		hasEnoughUnitsToBuy,
		isButtonLoading,
		tierArtworkType,
		btnAction,
		chainId,
		isActive,
		isLoading
	} = props;
	const { t } = useTranslation();

	const { chainId: currentChainId } = useChain();
	const hasWrongChainIdToBuy = currentChainId !== chainId;
	const chainProps = networkMap[chainId];

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { btnText, labelText, descText } = useMemo(() => {
		const titles = {
			labelText: t(`components.buyNft.${tierArtworkType}.title`),
			descText: t(`components.buyNft.${tierArtworkType}.desc`)
		};

		if (!isAvailable) {
			return {
				...titles,
				btnText: t('components.nft.notAvailable')
			};
		}

		if (isWhitelistSaleAndUserUnverified) {
			return {
				labelText: t('components.buyNft.notEligibleMessage.title'),
				descText: t('components.buyNft.notEligibleMessage.desc'),
				btnText: isAuthorized ? t('components.buyNft.btnTextNotEligible') : t('actions.labels.login')
			};
		}

		if (hasEnoughUnitsToBuy) {
			return {
				...titles,
				btnText: isAuthorized ? t(`components.buyNft.btnTextEligible`, { price, currency }) : t('actions.labels.login')
			};
		}

		return {
			...titles,
			btnText: t('components.nft.noUnits')
		};
	}, [
		price,
		currency,
		tierArtworkType,
		hasEnoughUnitsToBuy,
		isAvailable,
		isWhitelistSaleAndUserUnverified,
		isAuthorized,
		t
	]);

	const isNegative = isWhitelistSaleAndUserUnverified || !hasEnoughUnitsToBuy || !isAvailable;

	const isBtnDisabled = (isAuthorized && (!hasEnoughUnitsToBuy || hasWrongChainIdToBuy)) || !isAvailable;

	if (!isLoading && !isActive) {
		return null;
	}

	return (
		<div className="bg-overlaySecondary mt-5 flex min-h-[68px] flex-wrap items-center justify-center gap-4 rounded-lg py-3 px-5 sm:justify-between sm:gap-x-0">
			{isLoading ? (
				<div className="flex w-full flex-col gap-1.5">
					<SkeletonComponent className="rounded" width="80%" height={16} />
					<SkeletonComponent className="rounded" width="90%" height={16} />
				</div>
			) : (
				<>
					<div className="flex flex-wrap items-center justify-center gap-4">
						{isNegative && (
							<div className="flex w-full justify-center sm:w-max">
								<div className="bg-accentNegativeBackground flex h-10 w-10 items-center justify-center rounded-full">
									<ExclamationMarkIcon fill={colors.accentNegative} />
								</div>
							</div>
						)}

						<div>
							<Label1 className="sm:text-start text-center">{labelText}</Label1>
							<SubHeading className="sm:text-start text-center" color={colors.foregroundSecondary}>
								{descText}
							</SubHeading>
						</div>
					</div>
					<BuyNftButton
						tooltipContent={
							isAuthorized && hasWrongChainIdToBuy
								? t(`components.buyNft.btnTooltipTextWrongChain`, { chainName: chainProps.name })
								: undefined
						}
						isLoading={isButtonLoading}
						disabled={isBtnDisabled}
						onClick={btnAction}
						label={btnText}
						color="accentPrimary"
						size="lg"
					/>
				</>
			)}
		</div>
	);
};
