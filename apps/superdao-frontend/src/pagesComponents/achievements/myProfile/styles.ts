export const getMyProfileClass = (isMobile: boolean) => {
	const userLevel =
		'flex flex-row items-start justify-center py-6 px-5 gap-4 bg-backgroundSecondary rounded-[12px] flex-none order-1 grow-0';

	const desktopUserLevelContainer = 'flex flex-row items-center gap-[21px] w-[720px]  h-[40px] flex-none order-none';
	const mobileUserLevelContainer =
		'flex flex-row items-center p-0 gap-[21px]  h-[40px] flex-none order-none w-[-webkit-fill-available]';
	const userLevelContainer = isMobile ? mobileUserLevelContainer : desktopUserLevelContainer;

	const desktopUserLevelLeft =
		'flex flex-row items-center p-0 gap-[21px] w-[587px]  h-[40px] flex-none order-none grow';
	const mobileUserLevelLeft = 'flex flex-row items-center p-0 gap-[21px]  h-[40px] flex-none order-none grow';
	const userLevelLeft = isMobile ? mobileUserLevelLeft : desktopUserLevelLeft;

	const desktopUserLevelLeftContainer =
		'flex flex-row items-center p-0 gap-2 w-[86px]  h-[40px] flex-none order-none self-stretch grow-0';
	const mobileUserLevelLeftContainer = 'flex flex-row items-start p-0 gap-2 w-full';
	const userLevelLeftContainer = isMobile ? mobileUserLevelLeftContainer : desktopUserLevelLeftContainer;

	const desktopUserLevelText =
		'w-[587px]  h-[21px] not-italic font-semibold text-[15px] leading-[21px] tracking-[-0.24px] text-foregroundPrimary flex-none order-1 grow-0';
	const mobileUserLevelText =
		'h-[21px] not-italic font-semibold text-[13px] leading-[18px] tracking-[-0.24px] text-foregroundPrimary flex-none grow-0';
	const userLevelText = isMobile ? mobileUserLevelText : desktopUserLevelText;

	const desktopUserLevelButton =
		'w-[112px] h-[32px] py-0 px-3 bg-backgroundTertiary hover:bg-backgroundTertiaryHover flex flex-row items-center rounded-lg';
	const mobileUserLevelButton =
		'w-[118px] h-[32px] py-0 px-3 bg-backgroundTertiary hover:bg-backgroundTertiaryHover flex flex-row items-center rounded-lg justify-center';
	const userLevelButton = isMobile ? mobileUserLevelButton : desktopUserLevelButton;

	const desktopUserLevelButtonText =
		'text-foregroundPrimary  px-1 text-[14px] font-semibold not-italic leading-5 tracking-[-0.24px]';
	const mobileUserLevelButtonText =
		'text-foregroundPrimary  px-1 text-[14px] font-semibold not-italic leading-5 tracking-[-0.24px] ';
	const userLevelButtonText = isMobile ? mobileUserLevelButtonText : desktopUserLevelButtonText;

	const userLevelRight = 'flex flex-row items-start p-0 w-[118px] h-[32px]  flex-none order-1 grow-0';

	return {
		userLevel: userLevel,
		userLevelContainer: userLevelContainer,
		userLevelLeft: userLevelLeft,
		userLevelRight: userLevelRight,
		userLevelLeftContainer: userLevelLeftContainer,
		userLevelText: userLevelText,
		userLevelButton: userLevelButton,
		userLevelButtonText: userLevelButtonText
	};
};
