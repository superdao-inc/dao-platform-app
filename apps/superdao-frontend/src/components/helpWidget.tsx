import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useZendeskWidget } from 'src/hooks/zendesk-widget';
import { openExternal } from 'src/utils/urls';
import { BookIcon, ChatIcon, QuestionIcon } from './assets/icons';
import { IconButton } from './button';
import { DropdownMenu } from './dropDownMenu';
import { TooltipContent } from './navigation/tooltipContent';
import Tooltip from './tooltip';

export const HelpWidget = () => {
	const { t } = useTranslation();

	const {
		Widget: Zendesk,
		controls: { on: handleOnZendesk }
	} = useZendeskWidget();

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleRedirectToKnowledgeBase = () => openExternal('https://help.superdao.co/');

	const options = [
		{
			label: t('tooltips.navigation.knowledge.title'),
			before: <BookIcon />,
			onClick: handleRedirectToKnowledgeBase
		},
		{
			label: t('tooltips.navigation.chat.title'),
			before: <ChatIcon />,
			onClick: handleOnZendesk
		}
	];

	const handleMenuSwitch = (isOpen: boolean) => {
		setIsMenuOpen(isOpen);
	};

	return (
		<>
			<Zendesk />

			<div className="fixed bottom-5 right-5 hidden h-10 w-10 lg:block">
				<Tooltip
					isVisible={!isMenuOpen}
					content={<TooltipContent description={t('tooltips.support.description')} />}
					placement="left"
				>
					<div className="h-10 w-10">
						<DropdownMenu
							placement="top-start"
							className={`${
								isMenuOpen ? 'bg-accentPrimary' : 'bg-overlaySecondary hover:bg-overlayTertiary'
							} h-10 w-10 rounded-full`}
							control={
								<IconButton
									icon={<QuestionIcon fill={isMenuOpen ? '#FFFFFF' : '#717A8C'} />}
									size="md"
									color={isMenuOpen ? 'accentPrimary' : 'foregroundTertiary'}
								/>
							}
							shouldCloseOnSelect
							options={options}
							onSwitch={handleMenuSwitch}
						/>
					</div>
				</Tooltip>
			</div>
		</>
	);
};
