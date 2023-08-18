import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import { memo, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import isMobile from 'is-mobile';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, ChevronRight, DropdownMenu, EditIcon, Title2 } from 'src/components';
import { colors } from 'src/style';
import { DaoShowcaseCard } from 'src/pagesComponents/dao/daoShowcaseCard';
import { Arrow } from 'src/components/assets/icons/arrow';
import { AuthAPI } from 'src/features/auth';
import { UserAPI } from 'src/features/user';
import { isAdmin } from 'src/utils/roles';
import { PublicTreasuryNftsQuery } from 'src/gql/treasury.generated';

const SCROLL_AMOUNT = 200;
const IS_MOBILE = isMobile();

type DaoShowcaseContainerProps = {
	daoId: string;
	daoSlug: string;
	treasuryNfts: NonNullable<PublicTreasuryNftsQuery['treasury']>['nfts'];
	isLoading?: boolean;

	className?: string;
};

const Showcase = (props: DaoShowcaseContainerProps) => {
	const { daoId, daoSlug, treasuryNfts, isLoading = false, className = '' } = props;

	const { t } = useTranslation();

	const { push } = useRouter();

	const isAuthorized = AuthAPI.useIsAuthorized();
	const { currentUserMemberRole } =
		UserAPI.useCurrentUserMemberRoleQuery({ daoId }, { enabled: isAuthorized, cacheTime: 0 })?.data || {};

	const isAdminRole = isAdmin(currentUserMemberRole);

	const [leftControlVisible, setLeftControlVisible] = useState(false);
	const [rightControlVisible, setRightControlVisible] = useState(true);
	const cardsToShow = IS_MOBILE ? 2 : 4;
	const carousel = useRef<HTMLDivElement>(null);

	const handleGoToNft = () => push(`${daoSlug}/treasury/nfts`);

	useEffect(() => {
		carousel.current?.addEventListener('touchstart', (e) => {
			e.preventDefault();
		});
	}, [carousel]);

	useEffect(() => {
		setLeftControlVisible(false);
		if (treasuryNfts && treasuryNfts.length <= cardsToShow) {
			setRightControlVisible(false);
		} else {
			setRightControlVisible(true);
		}
	}, [treasuryNfts, cardsToShow]);

	useEffect(() => {
		if (treasuryNfts && treasuryNfts.length < cardsToShow) {
			return () => {};
		}
		const { current } = carousel;
		const handleScroll = (e: Event) => {
			const { scrollLeft, offsetWidth, scrollWidth } = e.target as any;
			if (leftControlVisible && scrollLeft <= 0) {
				setLeftControlVisible(false);
			} else if (!leftControlVisible && scrollLeft > 0) {
				setLeftControlVisible(true);
			}
			if (rightControlVisible && Math.ceil(offsetWidth + scrollLeft) >= scrollWidth) {
				setRightControlVisible(false);
			} else if (!rightControlVisible && offsetWidth + scrollLeft < scrollWidth) {
				setRightControlVisible(true);
			}
		};

		current?.addEventListener('scroll', handleScroll);

		return () => {
			current?.removeEventListener('scroll', handleScroll);
		};
	}, [treasuryNfts, leftControlVisible, rightControlVisible, daoSlug, cardsToShow]);

	const handleLeftControl = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const { current } = carousel;
		if (current) {
			current.scrollLeft -= SCROLL_AMOUNT;
		}
	};
	const handleRightControl = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const { current } = carousel;
		if (current) {
			current.scrollLeft += SCROLL_AMOUNT;
		}
	};

	const TitleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
		treasuryNfts?.length > 4 ? <button onClick={handleGoToNft}>{children}</button> : <>{children}</>;

	return (
		<>
			<Header data-testid="DaoPage__Showcase" className={cn('items-center', className)}>
				<TitleWrapper>
					<HeaderText>
						<Title2 data-testid="DaoPage__showcaseHeader">{t('pages.dao.showcase.header.title')}</Title2>
						{Boolean(treasuryNfts?.length) && <Title2 color={colors.foregroundTertiary}>{treasuryNfts?.length}</Title2>}
						{treasuryNfts?.length > 4 && (
							<ChevronRight width={16} height={16} fill={colors.foregroundTertiary} className="mt-2" />
						)}
					</HeaderText>
				</TitleWrapper>
				{isAdminRole && (
					<div className="flex items-center">
						<DropdownMenu
							options={[
								{
									label: t('pages.dao.showcase.header.menu.customize'),
									before: <EditIcon />,
									onClick: handleGoToNft
								}
							]}
							data-testid="DaoPage__showcaseDropdown"
						/>
					</div>
				)}
			</Header>
			<div className="relative">
				<div
					className="scrollbar-hide flex snap-x gap-5 overflow-x-hidden scroll-smooth pt-2 sm:overflow-x-scroll"
					ref={carousel}
				>
					{treasuryNfts?.map((nft) => (
						<DaoShowcaseCard key={nft.tokenId} nft={nft} isQueryLoading={isLoading} />
					))}
				</div>
				{leftControlVisible && (
					<button
						onClick={handleLeftControl}
						className="from-backgroundPrimary absolute inset-y-2/4 left-0 h-full w-14 -translate-y-1/2 bg-gradient-to-r transition-all ease-in-out"
					>
						<ArrowLeftIcon className="ml-3.5 hidden sm:block" />
						<div className="bg-backgroundPrimary ml-3.5 block flex h-[32px] w-[32px] items-center justify-center rounded-full sm:hidden">
							<Arrow />
						</div>
					</button>
				)}
				{rightControlVisible && (
					<button
						onClick={handleRightControl}
						className="from-backgroundPrimary absolute inset-y-2/4 right-0 h-full w-14 -translate-y-1/2 bg-gradient-to-l transition-all ease-in-out"
					>
						<ArrowLeftIcon className="ml-3.5 hidden rotate-180 sm:block" />
						<div className="bg-backgroundPrimary left-0 ml-2 flex h-[32px] w-[32px] items-center justify-center rounded-full sm:hidden">
							<Arrow className="rotate-180" />
						</div>
					</button>
				)}
			</div>
		</>
	);
};

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 16px;
`;

const HeaderText = styled.div`
	display: flex;
	gap: 8px;
	max-width: fit-content;
`;

export default memo(Showcase);
