import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { SelectNftField, FormType, SelectNftProps } from '../../dao/nftSelect';
import { AirdropParticipantType } from '../types';

import { colors } from 'src/style';
import { Caption, ChevronIcon, Label1, MemberIcon, NoMembersIcon, SubHeading } from 'src/components';
import { usePrevious } from 'src/hooks/usePrevious';
import { NftTier } from 'src/types/types.generated';

type Props = {
	isWhitelistMode?: boolean;
	isLoading: boolean;
	csvTierName: string;
	csvTierCount: number;
	options: SelectNftProps[];
	tiers: NftTier[];
	participantsByTier: Record<string, AirdropParticipantType[]>;
	participants: AirdropParticipantType[];
	onSetError: (csvTierName: string, isError: boolean) => void;
	onSelectTier: (...props: any[]) => void;
};

export const TierManager = (props: Props) => {
	const { t } = useTranslation();

	const [value, setValue] = useState<string[]>([]);
	const [selectedTier, setSelectedTier] = useState<NftTier | undefined>(undefined);

	const {
		isWhitelistMode,
		isLoading,
		participantsByTier,
		participants,
		csvTierName,
		csvTierCount,
		tiers,
		options,
		onSetError,
		onSelectTier
	} = props;

	const { id } = selectedTier || {};
	const prevTier = usePrevious(id);
	const isEmpty = csvTierName.trim() === '';
	const csvTier = selectedTier && participantsByTier?.[selectedTier?.id];
	const isError = selectedTier ? selectedTier.maxAmount - selectedTier.totalAmount < (csvTier?.length ?? 0) : false;

	const formType = isWhitelistMode ? FormType.whitelist : FormType.airdrop;

	useEffect(() => onSetError(csvTierName, isError), [csvTierName, isError, onSetError]);

	useEffect(() => {
		setValue([]);
	}, [participants]);

	useEffect(() => {
		if (prevTier !== id) {
			onSelectTier(prevTier, id);
		}
	}, [id, prevTier, onSelectTier]);

	const handleChange = (value: string[]) => {
		setValue(value);

		if (formType === FormType.whitelist) {
			const selectedTiers = value ? tiers?.filter((tier) => value.includes(tier.id)) : undefined;
			onSelectTier(selectedTiers?.map((tier) => tier.id) ?? []);
		}

		if (formType === FormType.airdrop) {
			const tier = tiers?.find((tier) => tier.id === value[0]);
			setSelectedTier(tier);
		}
	};

	return (
		<div className="bg-backgroundTertiary mb-6 p-3 sm:mb-4 sm:bg-inherit sm:p-0">
			<div className="items-center sm:flex" key={csvTierName}>
				<div className="flex-1 sm:max-w-[calc(50%_-_22px)]">
					<TierCard>
						<StyledMemberIconWrapper>
							{isEmpty ? <NoMembersIcon width={24} height={24} /> : <MemberIcon width={24} height={24} />}
						</StyledMemberIconWrapper>

						<div className="ml-4 truncate">
							<Label1>{isEmpty ? t('pages.importMembers.tierMatcher.notFoundTier') : csvTierName}</Label1>
							<SubHeading
								className="truncate"
								color={!isWhitelistMode && isError ? colors.accentNegativeActive : colors.foregroundSecondary}
							>
								{t('pages.importMembers.tierMatcher.walletsCount', { count: csvTierCount })}
							</SubHeading>
						</div>
					</TierCard>
				</div>

				<div className="sm:items-inherit sm:justify-inherit flex w-full rotate-90 items-center justify-center py-1.5 px-3 sm:w-auto sm:rotate-0 sm:py-0">
					<ChevronIcon width={20} height={20} />
				</div>

				<div className="flex-1 sm:max-w-[calc(50%_-_22px)]">
					<SelectNftField
						formType={formType}
						isLoading={isLoading}
						options={options}
						name="members"
						value={value.join('')}
						onChange={handleChange}
						isManual={false}
						menuPlacement="auto"
					/>
				</div>
			</div>
			{!isWhitelistMode && isError && (
				<Caption css={cssCaption} color={colors.accentNegativeActive}>
					{t('pages.importMembers.tierMatcher.error')}
				</Caption>
			)}
		</div>
	);
};

const cssCaption = css`
	margin-top: 8px;
	padding: 0 20px;
`;

const StyledMemberIconWrapper = styled.div`
	display: inline-flex;
	padding: 8px;
	background-color: ${colors.overlayTertiary};
	border-radius: 50%;
`;

const TierCard = styled.div`
	display: flex;
	align-items: center;

	background-color: ${colors.backgroundSecondary};
	border-radius: 8px;
	padding: 14px 20px;
`;
