import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { getNftTypeData, UNLIMITED_MAX_AMOUNT_VALUE } from 'src/constants';
import styled from '@emotion/styled';
import upperFirst from 'lodash/upperFirst';
import { BoldArrowRight, EditIcon, TrashIcon } from 'src/components/assets/icons';
import { colors } from 'src/style';
import { DnDHandler } from 'src/components/assets/icons/dndHandler';
import { EyeVisible } from 'src/components/assets/icons/eyeVisible';
import { EyeInvisible } from 'src/components/assets/icons/eyeInvisible';
import { Caption, SubHeading } from 'src/components';
import { TierArtworkTypeStrings } from 'src/types/types.generated';

const getAvailability = (maxAmount: number = 0, totalAmount: number = 0) => {
	if (maxAmount === UNLIMITED_MAX_AMOUNT_VALUE) {
		return 'unlimited, ';
	}

	if (!maxAmount) {
		return '';
	}

	return `${maxAmount - totalAmount} available, `;
};

type Props = {
	tierName?: string;
	tierPreview?: string | null;
	tierArtworkType?: TierArtworkTypeStrings;
	tierMaxAmount?: number;
	tierTotalAmount?: number;
	isDeactivated: boolean;
	isHidden: boolean;
	onClick: React.MouseEventHandler;
	onClickRemove: React.MouseEventHandler;
	onHiddennessToggle: React.MouseEventHandler;
	containerRef?: React.LegacyRef<HTMLDivElement>;
};

export const TierListItem: React.FC<Props> = (props) => {
	const {
		tierName,
		tierPreview,
		tierArtworkType,
		tierMaxAmount,
		tierTotalAmount,
		isDeactivated,
		isHidden,
		onClick,
		onClickRemove,
		onHiddennessToggle,
		containerRef,
		...rest
	} = props;
	const { t } = useTranslation();
	const { TierArtworkTypeIcon } = getNftTypeData(tierArtworkType);
	const handleTrashClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();

		onClickRemove(event);
	};

	const handleVisibilityChange = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();

		onHiddennessToggle(event);
	};

	const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onClick(event);
	};

	const amountInfo = `${getAvailability(tierMaxAmount, tierTotalAmount)}${tierTotalAmount} owned by users`;

	return (
		<div
			ref={containerRef}
			{...rest}
			className={cn(
				isDeactivated ? 'text-foregroundTertiary' : 'text-foregroundPrimary',
				'bg-overlaySecondary hover:bg-overlayTertiary  my-1 flex min-h-[40px] w-full cursor-pointer items-center rounded-lg py-2 pr-1 pl-4 text-sm'
			)}
			onClick={onClick}
			data-testid="TierListItem"
		>
			<DnDHandler className="mr-4" />
			{tierPreview && <img src={tierPreview} className="mr-3 h-12 w-12 rounded" />}
			<div>
				<div className="flex items-center">
					<StyledSubheading className="mr-2">{`${upperFirst(tierName)} ${
						isDeactivated ? t('pages.editNfts.collection.tiers.deactivatedTierLabel') : ''
					}`}</StyledSubheading>
					{TierArtworkTypeIcon && <TierArtworkTypeIcon fill={colors.foregroundTertiary} />}
				</div>
				<Caption color={colors.foregroundTertiary}>{amountInfo}</Caption>
			</div>

			<div className="ml-auto flex items-center">
				<button
					type="button"
					onClick={handleVisibilityChange}
					className="hover:bg-overlaySecondary mr-2 flex h-8 w-8 items-center justify-center rounded-md"
				>
					{isHidden ? <StyledSvgIcon as={EyeInvisible} /> : <StyledSvgIcon as={EyeVisible} width={24} height={24} />}
				</button>
				<button
					type="button"
					onClick={handleEditClick}
					className="hover:bg-overlaySecondary mr-2 flex h-8 w-8 items-center justify-center rounded-md"
				>
					<StyledSvgIcon as={EditIcon} />
				</button>
				{isDeactivated ? (
					<BoldArrowRight className="ml-2 mr-2" />
				) : (
					<button
						type="button"
						className="hover:bg-overlaySecondary flex h-8 w-8 items-center justify-center rounded-md"
						onClick={handleTrashClick}
						data-testid="TierListItem__trashBtn"
					>
						<TrashIcon className="block" fill={colors.accentNegative} width={22} />
					</button>
				)}
			</div>
		</div>
	);
};

const StyledSvgIcon = styled.svg`
	path {
		fill: ${colors.foregroundTertiary};
	}
`;

const StyledSubheading = styled(SubHeading)`
	font-weight: 600;
	font-size: 15px;
	line-height: 21px;
	letter-spacing: -0.24px;
`;
