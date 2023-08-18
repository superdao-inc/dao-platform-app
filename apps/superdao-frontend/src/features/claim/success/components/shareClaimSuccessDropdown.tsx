import { useTranslation } from 'next-i18next';

import React from 'react';
import { Button, Dropdown, ShareIcon } from 'src/components';
import { ShareSocialButtons } from './shareSocialButtons';

type Props = {
	isSocialShareDropdownOpen: boolean;
	fullUrl: string;
	targetNftUrl: string;
	daoName: string;
	handleSwitchSocialShareDropdownMode: () => void;
	onClickOutside?: () => void;
};

export const ShareClaimSuccessDropdown = (props: Props) => {
	const {
		isSocialShareDropdownOpen,
		fullUrl,
		targetNftUrl,
		daoName,
		handleSwitchSocialShareDropdownMode,
		onClickOutside
	} = props;

	const { t } = useTranslation();

	const Wrapper = ({ children }: { children: React.ReactNode }) => <div className="children:w-[248px]">{children}</div>;

	return (
		<Dropdown
			isOpen={isSocialShareDropdownOpen}
			placement="bottom-start"
			customWrapper={Wrapper}
			className="h-7"
			onClickOutside={onClickOutside}
			content={<ShareSocialButtons fullUrl={fullUrl} targetNftUrl={targetNftUrl} daoName={daoName} />}
		>
			<Button
				onClick={handleSwitchSocialShareDropdownMode}
				color="overlayTertiary"
				size="lg"
				className="py-2 px-5"
				leftIcon={<ShareIcon width={16} height={16} />}
				label={t('actions.labels.share')}
			/>
		</Dropdown>
	);
};
