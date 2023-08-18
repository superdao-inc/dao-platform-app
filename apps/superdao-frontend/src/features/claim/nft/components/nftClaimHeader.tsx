import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { CrossThinIcon } from 'src/components';
import { MobileHeader } from 'src/components/mobileHeader';
import { Name } from 'src/pagesComponents/common/header';

type Props = {
	isLogoOnly?: boolean;
	className?: string;
	onClose?: () => void;
};

export const NftClaimHeader = (props: Props) => {
	const { onClose, className, isLogoOnly } = props;
	const { t } = useTranslation();

	return (
		<div
			className={cn(`flex flex-row items-center px-4 py-4 sm:bg-transparent sm:px-6 sm:py-6 lg:hidden`, className, {
				'bg-transparent': isLogoOnly,
				'bg-backgroundSecondary': !isLogoOnly
			})}
		>
			<MobileHeader
				className="flex w-full flex-row-reverse justify-between bg-transparent py-0 sm:flex-row"
				title={
					<>
						{!isLogoOnly && <Name className="grow sm:hidden">{t('pages.claim.nftClaiming.heading')}</Name>}
						<div data-testid="LeftMenu__logo" className={cn({ 'm-auto sm:m-0': isLogoOnly })}>
							<a href="https://superdao.co/" target="_blank" rel="noreferrer">
								<img
									width="164px"
									height="56px"
									src="/logo-full.svg"
									className={cn('sm:hidden', { hidden: !isLogoOnly })}
								/>
							</a>
						</div>
					</>
				}
				withBurger
				burgerClassName="hidden sm:flex"
				right={
					onClose && (
						<CrossThinIcon
							className={cn('h-6 w-6 cursor-pointer sm:block', { hidden: isLogoOnly })}
							width={24}
							height={24}
							onClick={onClose}
							data-testid="DaoForm__closeButton"
						/>
					)
				}
			/>
		</div>
	);
};
