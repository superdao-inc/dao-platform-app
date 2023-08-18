export const getLevelAccordionClass = (isMobile: boolean) => {
	const mobileLevelAccordionContent =
		'flex justify-center  py-3 px-4 gap-2  w-full flex-col  bg-backgroundSecondary rounded-xl min-h-[56px]';

	const desktopLevelAccordionContent = 'bg-backgroundSecondary flex w-full cursor-pointer flex-col rounded-xl p-5';

	const LevelAccordionContent = isMobile ? mobileLevelAccordionContent : desktopLevelAccordionContent;

	return { LevelAccordionContent: LevelAccordionContent };
};

export const getLevelMapPageContentClass = (isMobile: boolean) => {
	const mobileTextLink = 'not-italic font-normal text-[13px] leading-[18px] tracking-[-0.08px] text-accentPrimary';

	const desktopTextLink = 'text-accentPrimary';

	const textLink = isMobile ? mobileTextLink : desktopTextLink;

	const mobileText = 'not-italic font-normal text-[13px] leading-[18px] tracking-[-0.08px] text-foregroundSecondary';

	const desktopText = '';

	const text = isMobile ? mobileText : desktopText;

	return { textLinkClass: textLink, textClass: text };
};

export const getLevelTitleClass = (isMobile: boolean) => {
	const mobileLevelTitle =
		'not-italic font-normal text-[13px] leading-[18px] tracking-[-0.08px] text-foregroundSecondary pl-2';

	const desktopLevelTitle = 'text-foregroundSecondary pl-2';

	const levelTitle = isMobile ? mobileLevelTitle : desktopLevelTitle;

	return { levelTitleTextClass: levelTitle };
};

export const getLevelProgressClass = (isMobile: boolean) => {
	const mobileLevelProgress =
		'not-italic font-normal text-[13px] leading-[18px] tracking-[-0.08px] text-foregroundSecondary min-w-[100px] pl-2';

	const desktopLevelProgress = 'text-foregroundSecondary min-w-[100px] pl-2';

	const levelProgress = isMobile ? mobileLevelProgress : desktopLevelProgress;

	return { levelProgressClass: levelProgress };
};

export const getBonusInfoClass = (isMobile: boolean) => {
	const mobileContainer = 'items-start';

	const desktopContainer = '';

	const bonusInfo = isMobile ? mobileContainer : desktopContainer;

	return { bonusInfoClass: bonusInfo };
};
