import { ForwardedRef, forwardRef, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import {
	DaoSinglePlaceholder,
	DaoMultiValue,
	DaoMultiPlaceholder,
	AirdropDaoSingleValue,
	StyledMemberIconWrapper
} from './select/customSelectComponents';
import { customDaoSelectColourStyles } from './select/customSelectStyle';
import { ToAirdropField } from './toAirdropField';
import { ToWhitelistField } from './toWhitelistField';
import { FormType, SelectNftFieldProps } from './types';
import { NotAssignedIcon } from 'src/components/assets/icons/nft';
import { CheckIcon } from 'src/components';
import { defaultAllOption } from 'src/components/customSelect/useDefaultSelectAll';

export const SelectNftField = forwardRef(
	(
		{ formType, isManual = true, isError = false, options, trigger, ...props }: SelectNftFieldProps,
		ref: ForwardedRef<HTMLDivElement>
	) => {
		const { t } = useTranslation();
		const optionsWithNotAssigned = useMemo(
			() => [
				{
					value: '',
					label: t('pages.importMembers.notAssigned'),
					description: t('modals.tierManager.airdrop.action.notSendNft'),
					icon: (
						<StyledMemberIconWrapper>
							<NotAssignedIcon />
						</StyledMemberIconWrapper>
					)
				},
				...options
			],
			[options, t]
		);

		const customStyles = isManual
			? undefined
			: {
					styles: customDaoSelectColourStyles
			  };

		if (formType === FormType.airdrop) {
			const customProps = isManual
				? undefined
				: {
						...customStyles,
						options: optionsWithNotAssigned,
						maxMenuHeight: 240,
						components: { Placeholder: DaoSinglePlaceholder, SingleValue: AirdropDaoSingleValue(isError) }
				  };

			return <ToAirdropField options={options} trigger={trigger} {...props} {...customProps} ref={ref} />;
		}

		const customProps = isManual
			? undefined
			: {
					...customStyles,
					allOption: {
						...defaultAllOption(),
						label: t('actions.labels.selectAll'),
						icon: (
							<StyledMemberIconWrapper>
								<CheckIcon width={22} height={22} />
							</StyledMemberIconWrapper>
						)
					},
					allowSelectAll: true,
					maxMenuHeight: 240,
					components: { MultiValue: DaoMultiValue, Placeholder: DaoMultiPlaceholder }
			  };

		return <ToWhitelistField options={options} trigger={trigger} {...props} {...customProps} ref={ref} />;
	}
);

SelectNftField.displayName = 'SelectNftField';
