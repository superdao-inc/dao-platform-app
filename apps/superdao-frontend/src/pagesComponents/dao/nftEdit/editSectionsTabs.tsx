import cn from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

import { CollectionIcon, GlobeIcon, LockIcon } from 'src/components';
import { AdminPanelSections } from './types';
import { colors } from 'src/style';

type Props = {
	currentTab: AdminPanelSections;
	setTab: (tab: AdminPanelSections) => void;
};

const Tab: React.FC<JSX.IntrinsicElements['div'] & { isActive: boolean; icon: ReactNode }> = ({
	icon,
	isActive,
	children,
	...props
}) => {
	return (
		<StyledTab
			className={cn(
				'h-8 w-full cursor-pointer rounded py-1 text-center align-middle text-[15px]',
				isActive ? 'text-foregroundPrimary' : 'text-foregroundSecondary',
				{ 'bg-backgroundQuaternary': isActive }
			)}
			{...props}
		>
			<span className={isActive ? 'text-foregroundPrimary' : 'text-foregroundTertiary'}>{icon}</span>
			{children}
		</StyledTab>
	);
};

export const EditSectionsTabs = (props: Props) => {
	const { currentTab, setTab } = props;

	const { t } = useTranslation();

	const tabs = [
		{
			key: AdminPanelSections.collection,
			children: <>{t('pages.editNfts.tabs.collection')}</>,
			icon: <CollectionIcon className="mr-2 -mt-0.5 inline-block w-4 fill-current" />
		},
		{
			key: AdminPanelSections.privateSale,
			children: <>{t('pages.editNfts.tabs.privateSale')}</>,
			icon: <LockIcon className="mr-2 -mt-0.5 inline-block w-4 fill-current" />
		},
		{
			key: AdminPanelSections.publicSale,
			children: <>{t('pages.editNfts.tabs.publicSale')}</>,
			icon: <GlobeIcon className="mr-2 -mt-0.5 inline-block w-4 fill-current" />
		}
	];

	return (
		<div className="bg-overlaySecondary mt-3 mb-6 flex gap-1 rounded-lg p-1">
			{tabs.map((tab) => (
				<Tab key={tab.key} icon={tab.icon} isActive={currentTab === tab.key} onClick={() => setTab(tab.key)}>
					{tab.children}
				</Tab>
			))}
		</div>
	);
};
const StyledTab = styled.div`
	&:hover {
		background: ${colors.backgroundTertiary};
	}

	&:active {
		background: ${colors.backgroundQuaternary};
	}
`;
