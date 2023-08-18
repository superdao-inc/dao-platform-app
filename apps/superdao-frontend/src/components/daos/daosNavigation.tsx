import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { Button, IconButton } from '../button';
import { RequestBetaAccessModal } from '../modals/requestBetaAccessModal';
import { Avatar } from '../common/avatar';
import { Spacer } from '../spacer';
import { colors, borders } from 'src/style';
import { Caption, SubHeading, Label1, Title1, Title3 } from 'src/components/text';
import { DaosFilledIcon, PlusIcon } from 'src/components/assets/icons';
import { DaoLimitModal } from 'src/components/modals/daoLimitModal';
import { UserAPI } from 'src/features/user/API';

export const DaosNavigation = () => {
	const [isRequestOpen, setIsRequestOpen] = useState(false);
	const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

	const { t } = useTranslation();
	const router = useRouter();
	const activeDaoSlug = router.query.slug;

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};

	const { data: canCreateMoreData } = UserAPI.useCanCreateMoreDaoQuery();
	const { canCreateMoreDao } = canCreateMoreData ?? { canCreateMoreDao: false };

	const hasBetaAccess = userData?.hasBetaAccess;

	const { data: daos } = UserAPI.useUserDaoParticipationQuery({ userId: userData!.id });

	const { daoParticipation } = daos || {};
	if (!daoParticipation) return null;

	const handleCreateDao = () => {
		if (!hasBetaAccess) {
			setIsRequestOpen(true);
			return;
		}

		if (canCreateMoreDao) {
			router.push('/daos/create');
			return;
		}

		setIsLimitModalOpen(true);
	};

	return (
		<StickyWrapper>
			<Wrapper data-testid="DaosNavigation__daosList">
				<Header>
					<Title1 data-testid="DaosNavigation__daosListTitle">{t('components.navigation.secondary.title')}</Title1>
					<IconButton
						className="rounded-full"
						color="backgroundSecondary"
						size="md"
						icon={<PlusIcon width={20} height={20} />}
						onClick={handleCreateDao}
						data-testid="DaosNavigation__daosListCreateDaoButton"
					/>
				</Header>

				{!hasBetaAccess && <RequestBetaAccessModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />}
				{hasBetaAccess && <DaoLimitModal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} />}

				{daoParticipation.count ? (
					<div>
						<Label1 className="py-2 px-4" data-testid="DaosNavigation__daosListSecondaryHeader">
							{t('components.navigation.secondary.header')}
						</Label1>

						{daoParticipation.items.map((participation) => {
							const { dao } = participation;
							const { id, name, slug, avatar } = dao;
							const showActiveCondition = activeDaoSlug === slug && daoParticipation.count > 1;

							return (
								<Link key={id} href={`/${slug}`} passHref>
									<DaoItem isActive={showActiveCondition} data-testid={`DaosNavigation__daoItem${slug}`}>
										<Avatar seed={id} fileId={avatar} size="md" data-testid="DaosNavigation__daoItemAvatar" />

										<DaoItemText>
											<Label1 css={daoItemStyles} data-testid="DaosNavigation__daoItemName">
												{name}
											</Label1>
											<Spacer height={0} />
											<SubHeading color={colors.foregroundSecondary}>
												{t('components.userDaos.labels.members', {
													count: dao.membersCount
												})}
											</SubHeading>
										</DaoItemText>
									</DaoItem>
								</Link>
							);
						})}
					</div>
				) : (
					<EmptyList>
						<DaosFilledIcon width={36} height={36} />
						<Spacer height={8} />

						<Title3>
							{hasBetaAccess
								? t('components.navigation.secondary.nodaos.hasBetaAccess.title')
								: t('components.navigation.secondary.nodaos.noBetaAccess.title')}
						</Title3>
						<Spacer height={4} />

						<Caption color={colors.foregroundSecondary}>
							{hasBetaAccess
								? t('components.navigation.secondary.nodaos.hasBetaAccess.description')
								: t('components.navigation.secondary.nodaos.noBetaAccess.description')}
						</Caption>
						<Spacer height={24} />

						<Button
							onClick={handleCreateDao}
							color="backgroundTertiary"
							label={
								hasBetaAccess
									? t('components.navigation.secondary.nodaos.hasBetaAccess.requestLabel')
									: t('components.navigation.secondary.nodaos.noBetaAccess.requestLabel')
							}
							size="md"
						/>
					</EmptyList>
				)}
			</Wrapper>
		</StickyWrapper>
	);
};

const StickyWrapper = styled.div`
	position: sticky;
	top: 0;
	bottom: 0;
	left: 0;

	height: 100vh;
	width: 288px;

	overflow-y: auto;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	padding: 12px 16px;
`;

const Wrapper = styled.div`
	min-height: 100%;
	padding: 8px;

	position: relative;

	background-color: ${colors.backgroundSecondary};
`;

const EmptyList = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);

	width: 100%;
	padding: 0 32px;
	border-radius: ${borders.medium};

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
`;

const DaoItem = styled.a<{ isActive: boolean }>`
	padding: 8px 16px;
	display: flex;
	align-items: center;
	gap: 16px;

	border-radius: ${borders.medium};
	background-color: ${(props) => (props.isActive ? colors.overlaySecondary : 'transparent')};
	transition: background-color 300ms;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}

	&:not(:first-of-type) {
		margin-top: 2px;
	}
`;

const DaoItemText = styled.div`
	overflow: hidden;
`;

const daoItemStyles = css`
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;
