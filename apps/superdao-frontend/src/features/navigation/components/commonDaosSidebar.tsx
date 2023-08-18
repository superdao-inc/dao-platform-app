import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user';
import { PlusIcon } from 'src/components/assets/icons';
import Tooltip from 'src/components/tooltip';
import { TooltipContent } from 'src/components/navigation/tooltipContent';

import { CommonSkeletons } from './commonSkeletons';
import { DaoAvatarsList } from './daoAvatarsList';
import { useRect } from 'src/hooks/useRect';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';
import { DaoMode } from 'src/types/types.generated';

export const CommonDaosSidebar = () => {
	const { push, query } = useRouter();
	const { t } = useTranslation();

	const isDaoCase = !!query.slug;

	const [unscrolled, setUnscrolled] = useState(true);
	const [fullyScrolled, setFullyScrolled] = useState(false);

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: user, isLoading: isUserLoading } = UserAPI.useCurrentUserQuery(undefined, { enabled: isAuthorized });
	const { currentUser: userData } = user || {};

	const { data: daos, isLoading: isDaoLoading } = UserAPI.useUserDaoParticipationQuery(
		{ userId: userData?.id ?? '' },
		{ enabled: isAuthorized && !!userData }
	);
	const { daoParticipation } = daos || {};

	const { data: daoData, isLoading: isCurrentDaoLoading } = useDaoBySlugQuery(
		{ slug: query.slug as string },
		{ enabled: isDaoCase }
	);

	const { mode } = daoData?.daoBySlug || {};

	const isLoading = isUserLoading || isDaoLoading;

	const handleRedirectToDaoCreation = () => {
		push('/daos/create');
	};

	/**
	 * event is throttled by default
	 */
	const handleScroll = (e: MouseEvent) => {
		const notScrolled = !(e.target as any).scrollTop;
		const isFullyScrolled =
			(e.target as any).scrollTop + (e.target as any).clientHeight >= (e.target as any).scrollHeight;

		if (isFullyScrolled !== fullyScrolled) setFullyScrolled(isFullyScrolled);
		if (notScrolled !== unscrolled) setUnscrolled(notScrolled);
	};

	const [shouldPreventScroll, setShouldPreventScroll] = useState(false);

	const daoListRef = useRef<HTMLDivElement>(null);
	const bottomShadowRef = useRef<HTMLDivElement>(null);

	const daoListRect = useRect(daoListRef);
	const bottomShadowRect = useRect(bottomShadowRef);

	useEffect(() => {
		const isRendered = daoListRect && bottomShadowRect;
		if (!isRendered) return;

		const overlapBottom = bottomShadowRect.top < daoListRect.bottom;

		setShouldPreventScroll(!overlapBottom);
	}, [daoListRect, bottomShadowRect]);

	const isNotCustomDaoMode = !isDaoCase || isCurrentDaoLoading || mode === DaoMode.Default;

	return (
		<>
			<div css={[commonStyles, beforeStyles]} className={unscrolled ? 'opacity-0' : 'opacity-100'}></div>
			<div className="scrollbar-hide relative max-h-[calc(100vh-154px)] overflow-auto" onScroll={handleScroll as any}>
				<div className="h-max">
					{isLoading ? (
						<CommonSkeletons count={5} />
					) : (
						<DaoAvatarsList ref={daoListRef} daos={daoParticipation?.items} shouldPreventScroll={shouldPreventScroll} />
					)}
				</div>
				{isNotCustomDaoMode && (
					<div
						className={`bg-backgroundTertiary sticky bottom-0 left-0 z-20 touch-none ${
							daoParticipation?.items.length ? 'pt-4' : ''
						}`}
					>
						<Tooltip
							content={<TooltipContent description={t('tooltips.navigation.createDao.title')} />}
							placement="right"
						>
							<div
								className="hover:bg-overlayTertiary bg-overlaySecondary mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all"
								onClick={handleRedirectToDaoCreation}
								data-testid={'LeftMenu__addDaoButton'}
							>
								<PlusIcon width={24} height={24} />
							</div>
						</Tooltip>
					</div>
				)}
			</div>
			<div className="grow touch-none"></div>
			<div
				ref={bottomShadowRef}
				css={[commonStyles, isNotCustomDaoMode && afterStyles]}
				className={fullyScrolled ? 'opacity-0' : 'opacity-100'}
			></div>
		</>
	);
};

const commonStyles = css`
	position: absolute;
	left: 0;
	width: 64px;
	height: 30px;
	z-index: 10;
	transition: 250ms;
	pointer-events: none;
`;

const beforeStyles = css`
	top: 70px;
	background: linear-gradient(rgba(52, 58, 70, 1), rgba(52, 58, 70, 0));
`;

const afterStyles = css`
	bottom: 140px;
	background: linear-gradient(rgba(52, 58, 70, 0), rgba(52, 58, 70, 1));
`;
