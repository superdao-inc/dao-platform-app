import { useCallback, useMemo } from 'react';
import copy from 'clipboard-copy';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import {
	Button,
	ButtonProps,
	DoneIcon,
	DropdownMenu,
	FacebookOutlineIcon,
	LinkIcon,
	ShareIcon,
	toast,
	TwitterOutlineIcon
} from 'src/components';
import { openExternal } from 'src/utils/urls';

type Props = {
	className?: string;
	fullUrl?: string;
	daoName?: string;
} & ButtonProps;

export const ShareDropdown = ({ className, fullUrl, title, ...btnProps }: Props) => {
	const { t } = useTranslation();

	const handleCopyLink = useCallback(() => {
		try {
			navigator.share({ url: fullUrl });
		} catch {
			copy(fullUrl ?? '').then(() => {
				toast.success(t('actions.confirmations.linkCopy', { name }), {
					position: 'bottom-center',
					duration: 5000,
					icon: <DoneIcon width={20} height={20} className="fill-accentPositive" />
				});
			});
		}
	}, [fullUrl, t]);

	const handleShareFacebook = useCallback(() => {
		openExternal(`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`);
	}, [fullUrl]);

	const handleShareTwitter = useCallback(() => {
		openExternal(`https://twitter.com/intent/tweet?url=${fullUrl}&text=${title}`);
	}, [fullUrl, title]);

	const dropdownActionsOptions = useMemo(() => {
		return [
			{
				label: 'Twitter',
				before: <TwitterOutlineIcon width={22} height={22} />,
				onClick: handleShareTwitter
			},
			{
				label: 'Facebook',
				before: <FacebookOutlineIcon width={22} height={22} />,
				onClick: handleShareFacebook
			},
			{
				label: t('pages.dao.members.actions.copyLink'),
				before: <LinkIcon width={22} height={22} />,
				onClick: handleCopyLink
			}
		];
	}, [handleShareTwitter, handleShareFacebook, handleCopyLink, t]);

	return (
		<DropdownMenu
			control={
				<Button
					className={cn('whitespace-nowrap rounded-[4px] p-1', className)}
					label={<ShareIcon width={16} height={16} className="fill-foregroundSecondary" />}
					{...btnProps}
				/>
			}
			shouldCloseOnSelect
			options={dropdownActionsOptions}
		/>
	);
};
