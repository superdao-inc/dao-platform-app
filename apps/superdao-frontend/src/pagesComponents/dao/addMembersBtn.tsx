import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Button, ButtonProps, DropdownMenu, GiftIcon, WhitelistAddIcon } from 'src/components';
import { useDaoSales } from 'src/hooks';

type Props = {
	daoId: string;
	slug: string;
	toggleInterlayerUploadModal: () => void;
	toggleWhitelistInterlayerUploadModal: () => void;
} & ButtonProps;

export const AddMembersBtn = (props: Props) => {
	const { daoId, toggleInterlayerUploadModal, toggleWhitelistInterlayerUploadModal, ...btnProps } = props;

	const { t } = useTranslation();

	const { isLoading, isSaleActive } = useDaoSales(daoId);

	const dropdownActionsOptions = useMemo(() => {
		return isSaleActive
			? [
					{
						label: t('pages.dao.members.actions.addToWhitelist'),
						before: <WhitelistAddIcon width={23} height={23} />,
						onClick: toggleWhitelistInterlayerUploadModal
					},
					{
						label: t('pages.dao.members.actions.airdropToWhitelist'),
						before: <GiftIcon width={22} height={22} />,
						onClick: toggleInterlayerUploadModal
					}
			  ]
			: [
					{
						label: t('pages.dao.members.actions.airdropToWhitelist'),
						before: <GiftIcon width={22} height={22} />,
						onClick: toggleInterlayerUploadModal
					}
			  ];
	}, [isSaleActive, t, toggleInterlayerUploadModal, toggleWhitelistInterlayerUploadModal]);

	return (
		<DropdownMenu
			control={<Button className="whitespace-nowrap" isLoading={isLoading} {...btnProps} />}
			shouldCloseOnSelect
			options={isLoading ? [] : dropdownActionsOptions}
		/>
	);
};
