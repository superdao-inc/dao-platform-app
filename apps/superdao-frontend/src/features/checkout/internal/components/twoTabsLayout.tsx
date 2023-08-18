import React, { FC } from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { PageContent } from 'src/components';
import { borders, colors } from 'src/style';
import { MobileHeader } from 'src/components/mobileHeader';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';

type Props = {
	activeTabIndex: number;
	children?: React.ReactNode;
	shouldShowTabs?: boolean;
};

export const TwoTabsLayout: FC<Props> = (props) => {
	const { activeTabIndex, shouldShowTabs = true, children } = props;

	const { t } = useTranslation();
	const { navigation } = useCheckoutNavigationContext();

	const toDaoProfile = () => navigation.toDaoProfile();

	return (
		<PageContent columnSize="md" className=" lg:pt-5" columnClassName="flex flex-col" onClose={toDaoProfile}>
			<MobileHeader title={t('pages.checkout.heading')} onBack={toDaoProfile} />

			{shouldShowTabs && (
				<div className="absolute top-16 flex w-full gap-2 lg:top-12">
					<StepProgressItem isActive={activeTabIndex === 0} />
					<StepProgressItem isActive={activeTabIndex === 1} />
				</div>
			)}

			<div className="mt-10 flex flex-1 flex-col lg:mt-0 lg:justify-center">
				<div>{children}</div>
			</div>
		</PageContent>
	);
};

const StepProgressItem = styled.div<{ isActive?: boolean }>`
	flex: 1;

	height: 4px;
	border-radius: ${borders.medium};
	background: ${({ isActive }) => (isActive ? colors.foregroundPrimary : colors.foregroundQuaternary)};
`;
