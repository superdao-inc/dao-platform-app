import cn from 'classnames';

export const flexWrapper = 'flex items-start pb-3';

const defaultArtWrapperClass =
	'rounded-lg flex flex-col justify-center	items-center gap-12 text-center	break-words bg-backgroundSecondary pt-[52px] pb-8';
const mobileArtWrapperClass = 'bg-transparent	min-h-[80vh]';

export const getArtWrapperClass = (isMobile?: boolean) => cn(defaultArtWrapperClass, isMobile && mobileArtWrapperClass);

export const getWrapperEmptyClass = (isMobile?: boolean) => {
	const defaultWrapper = cn('flex flex-col justify-center items-center text-center');

	const desktopWrapper = `bg-backgroundSecondary rounded-lg pt-6 pr-6 pb-12 px-6 gap-6 break-words`;

	const mobileWrapper = 'flex min-h-[80vh] flex-col items-center justify-center gap-6 break-words px-6 text-center';

	return cn(defaultWrapper, isMobile ? mobileWrapper : desktopWrapper);
};

export const getNavigationClass = (isMobile?: boolean) => {
	const defaultNavigationUl = 'overflow-x-auto ml-auto mt-0 flex list-none gap-4 bg-backgroundPrimary py-4 pr-0';
	const mobileNavigationUl = 'scrollbar-hide';
	const navigationUl = isMobile ? cn(defaultNavigationUl, mobileNavigationUl) : defaultNavigationUl;

	const defaultAnchor =
		'flex items-center cursor-pointer py-2.5 px-4 bg-backgroundPrimary rounded-lg font-semibold text-foregroundSecondary transition-all duration-300 gap-2';
	const desktopAnchor =
		'!bg-backgroundSecondary  [&_svg]:fill-foregroundTertiary [&_svg]:transition-all [&_svg]:duration-300  hover:text-accentPrimaryHover [&_svg]:hover:fill-accentPrimaryHover';
	const anchorClass = isMobile ? defaultAnchor : cn(defaultAnchor, desktopAnchor);

	const desktopAnchorActive = '!text-accentPrimaryActive [&_svg]:!fill-accentPrimaryActive';
	const mobileAnchorActive = '!text-foregroundPrimary !bg-backgroundSecondary';
	const anchorActiveClass = isMobile ? mobileAnchorActive : desktopAnchorActive;

	const stickyWrapper = 'sticky top-0 left-0 overflow-y-auto -mt-4 z-1';

	return {
		navigationClass: cn(navigationUl),
		anchorClass: cn(anchorClass),
		anchorActiveClass: cn(anchorActiveClass),
		stickyWrapperClass: cn(stickyWrapper)
	};
};

export const getNftClass = () => {
	const Wrapper =
		'relative overflow-hidden flex justify-center flex-col rounded-lg bg-backgroundSecondary w-full sm:max-w-[220px] hover:cursor-auto';

	const IconWrapper =
		'w-7 h-7 rounded-[50%] bg-transparent transition duration-300 flex items-center justify-center hover:bg-backgroundTertiaryHover hover:cursor-pointer';

	const SquareWrapper = 'relative after:content-[""] after:block after:pb-[100%]';

	const ArtworkView = 'absolute top-0 bottom-0 left-0 right-0 rounded-lg [&_img]:rounded-lg';

	return {
		wrapperClass: cn(Wrapper),
		iconWrapperClass: cn(IconWrapper),
		squareWrapperClass: cn(SquareWrapper),
		artworkViewClass: cn(ArtworkView)
	};
};

export const getAssetImgClass = (isMobile: boolean) => {
	const defaultAssetImg = 'rounded-[50%] object-cover object-center inline-block mr-2.5';

	const desktopAssetImg = 'w-10 h-10';
	const mobileAssetImg = 'w-7 h-7';

	return cn(defaultAssetImg, isMobile ? mobileAssetImg : desktopAssetImg);
};
