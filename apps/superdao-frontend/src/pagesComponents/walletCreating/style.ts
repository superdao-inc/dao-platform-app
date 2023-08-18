import cn from 'classnames';

export const heading = 'font-bold text-[36px] leading-[48px] text-white pl-3';

export const getWalletClass = () => {
	const IconWrapper = 'flex justify-center items-center !w-10 !h-10 rounded-[50%] bg-overlayTertiary mr-4';

	const Row = 'flex cursor-pointer p-2 pl-3 hover:bg-overlaySecondary hover:rounded-[8px]';

	const Circle = 'h-6 w-6 rounded-[48px] flex items-center justify-around';

	return {
		rowClass: cn(Row),
		iconWrapperClass: cn(IconWrapper),
		circleClass: cn(Circle)
	};
};
