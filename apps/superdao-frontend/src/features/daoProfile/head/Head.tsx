import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import copy from 'clipboard-copy';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { memo, useCallback, useMemo } from 'react';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { generateCoverGradient } from 'src/utils/cover-generator';
import { ProfileHeader } from 'src/components/profileHeader';
import {
	Avatar,
	Body,
	Button,
	CopyIcon,
	IconButton,
	PolygonScanIcon,
	SettingsIcon,
	ShareIcon,
	SocialLinks,
	Title1,
	VerifyIcon
} from 'src/components';

import { openExternal, openPolygonScanByAddressAsExternal } from 'src/utils/urls';
import { DaoWhitelistJoin } from 'src/pagesComponents/dao/DaoWhitelistJoin';
import { CollapsableDescription } from 'src/components/collapsableDescription';
import { toast } from 'src/components/toast/toast';
import { colors } from 'src/style';
import { SharingAddon } from 'src/features/daoProfile/head/sharingAddon';
import { DefaultDaoIsCreatedModal } from 'src/components/modals/defaultDaoIsCreatedModal';
import { DaoIsCreatedModal } from 'src/features/checkout/internal/modals';
import { WelcomeToBetaModal } from 'src/components/modals/welcomeToBetaModal';
import { ProfileSharingModal } from 'src/components/modals/profileSharingModal';
import { SupportModal } from 'src/components/modals/supportModal';
import { mapDaoDataToUpdate, useSwitch } from 'src/hooks';
import {
	PublicDaoFragment,
	useDaoBySlugQuery,
	useDaoBySlugWithRolesQuery,
	useUpdateDaoMutation
} from 'src/gql/daos.generated';
import { AuthAPI } from 'src/features/auth';
import { UserAPI } from 'src/features/user';
import { isAdmin } from 'src/utils/roles';
import { DaoMemberRole } from 'src/types/types.generated';
import { useUserDaoParticipationQuery } from 'src/gql/user.generated';

type DaoProfileHeadProps = {
	dao: PublicDaoFragment;
	isDaoVerified: boolean;

	protocol: string;
	hostname: string;
};

const Head = (props: DaoProfileHeadProps) => {
	const { dao, isDaoVerified, protocol, hostname } = props;
	const {
		id: daoId,
		slug: daoSlug,
		name: daoName,
		description,
		contractAddress,
		collectionAddress,
		links,
		avatar,
		cover,
		whitelistUrl = ''
	} = dao;
	const { twitter, site, discord, telegram, instagram } = links;

	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { query, push, asPath } = useRouter();

	const [isDefaultDaoCreatedModalOpen, { off: closeDefaultDaoCreatedModal }] = useSwitch(Boolean(query.isClaim));
	const [isSharingModalOpen, { off: closeSharingModal, toggle: toggleSharingModal }] = useSwitch(false);
	const [isDaoIsCreatedModalOpen, { off: closeDaoIsCreatedModal }] = useSwitch(query.daoPass === 'success');
	const [isWelcomeToBetaModalOpen, { off: closeWelcomeToBetaModal }] = useSwitch(Boolean(query.welcomeToBeta));
	const [isSupportModalOpen, { off: closeSupportModal, on: openSupportModal }] = useSwitch(false);

	const { refetch } = useDaoBySlugWithRolesQuery({ slug: daoSlug });

	const isAuthorized = AuthAPI.useIsAuthorized();
	const { currentUser: user } = UserAPI.useCurrentUserQuery()?.data || {};
	const { id: userId } = user || {};

	const { currentUserMemberRole: role } =
		UserAPI.useCurrentUserMemberRoleQuery({ daoId }, { enabled: isAuthorized, cacheTime: 0 })?.data || {};

	const { mutate: updateDao } = useUpdateDaoMutation();

	const isCreator = isAdmin(role);

	const fullUrl = protocol + hostname + asPath;
	const publicLink = `${hostname}/${daoSlug}`;

	const hasAnySocialLink = twitter || instagram || discord || telegram || site;

	const canSeeWhitelistButton =
		!isAuthorized ||
		(role !== DaoMemberRole.Creator &&
			role !== DaoMemberRole.Member &&
			role !== DaoMemberRole.Admin &&
			role !== DaoMemberRole.Sudo);

	const shouldShowApplyToJoin = !role && !!whitelistUrl && !isAuthorized;
	const shouldShowDaoJoin = !role && !!whitelistUrl;

	const isJoinBlockAvailable = shouldShowApplyToJoin || (shouldShowDaoJoin && canSeeWhitelistButton);

	const handleDefaultCreatedDaoEdit = useCallback(
		(name: string) => {
			if (!userId) return;

			const mappedDao = mapDaoDataToUpdate(dao);

			updateDao(
				{ updateDaoData: { ...mappedDao, id: daoId, name } },
				{
					onSuccess: () => {
						closeDefaultDaoCreatedModal();
						push(`/${daoSlug}?isNew=1`, undefined, { shallow: true });
						refetch();
						// old query (before whitelist refactor)
						queryClient.refetchQueries('UserDaoParticipation');
						// new query (after whitelist refactor)
						queryClient.refetchQueries(useUserDaoParticipationQuery.getKey({ userId }));
						queryClient.refetchQueries(useDaoBySlugQuery.getKey({ slug: daoSlug }));
					},
					onError: () => {
						toast.error(t('components.dao.daoCreated.modal.error'), { position: 'bottom-center' });
					}
				}
			);
		},
		[closeDefaultDaoCreatedModal, dao, daoId, daoSlug, push, queryClient, refetch, t, updateDao, userId]
	);

	const handleDefaultDaoCreatedModalClose = useCallback(() => {
		closeDefaultDaoCreatedModal();
		void push(`/${daoSlug}?isNew=1`, undefined, { shallow: true });
	}, [closeDefaultDaoCreatedModal, daoSlug, push]);

	const handleDaoIsCreatedModalClose = useCallback(() => {
		closeDaoIsCreatedModal();
		void push(`/${daoSlug}`);
	}, [closeDaoIsCreatedModal, daoSlug, push]);

	const handleOpenPolygonScan = (address: string) => () => openPolygonScanByAddressAsExternal(address);

	const handleSocialLinkClick = (link: string) => openExternal(link);

	const handleCopyLink = () => {
		copy(`https://${publicLink}`).then(() => toast(t('actions.confirmations.linkCopy'), { id: 'wallet-address-copy' }));
	};

	const handleProfileEdit = useMemo(() => {
		if (isCreator) {
			return () => void push(`/${daoSlug}/settings/about/edit`);
		}
	}, [daoSlug, isCreator, push]);

	return (
		<>
			{/* Modals */}
			<SharingAddon
				fullUrl={fullUrl}
				daoName={daoName}
				daoDescription={description}
				hostname={hostname}
				protocol={protocol}
				slug={daoSlug}
			/>

			<DefaultDaoIsCreatedModal
				isOpen={isDefaultDaoCreatedModalOpen}
				onClose={handleDefaultDaoCreatedModalClose}
				onSave={handleDefaultCreatedDaoEdit}
			/>

			<DaoIsCreatedModal onButtonClick={handleDaoIsCreatedModalClose} isOpen={isDaoIsCreatedModalOpen} />

			<WelcomeToBetaModal isOpen={isWelcomeToBetaModalOpen} onClose={closeWelcomeToBetaModal} />

			{isSharingModalOpen && (
				<ProfileSharingModal
					isOpen
					onClose={closeSharingModal}
					avatar={
						<Avatar
							className="bg-backgroundSecondary border-backgroundSecondary absolute -top-[50px] left-1/2 m-0 h-[100px] w-[100px] -translate-x-2/4 rounded-full border-4"
							seed={daoId}
							src={avatar ? getOptimizedFileUrl(avatar) : undefined}
							size="92"
							data-testid="Profile__avatar"
						/>
					}
					title={daoName}
					description={description}
					fullUrl={fullUrl}
					twitterDescription={t('sharing.twitter.dao', { daoName: name })}
					contractAddress={contractAddress}
				/>
			)}

			<SupportModal isOpen={isSupportModalOpen} onClose={closeSupportModal} />

			{/* Component */}

			<ProfileHeader
				titleText={t('components.dao.title')}
				rightNode={
					<div className="flex items-center">
						<button onClick={toggleSharingModal} className="flex rounded-full p-3">
							<ShareIcon fill={colors.foregroundTertiary} width={24} height={24} />
						</button>

						{handleProfileEdit && (
							<button onClick={handleProfileEdit} className="rounded-full p-3">
								<SettingsIcon fill={colors.foregroundTertiary} width={24} height={24} />
							</button>
						)}
					</div>
				}
			/>

			<div className="bg-backgroundSecondary rounded-xl p-2">
				<div
					className="h-40 rounded-lg !bg-cover !bg-center"
					style={{
						background: cover ? `url(${getOptimizedFileUrl(cover)})` : generateCoverGradient(daoId)
					}}
					data-testid="Profile__cover"
				/>

				<main className="bg-backgroundSecondary relative flex flex-col items-center rounded-xl px-4 pt-6 pb-5 lg:mt-0 lg:items-start lg:rounded-none lg:rounded-b-xl">
					<Avatar
						className="bg-backgroundSecondary border-backgroundSecondary absolute top-0 -translate-y-1/2 transform rounded-full border-[8px] lg:left-5"
						seed={daoId}
						src={avatar ? getOptimizedFileUrl(avatar) : undefined}
						size="112"
						data-testid="Profile__avatar"
					/>

					<Title1
						className="max-w-100 mt-11 flex w-full items-center gap-1 truncate lg:mt-3"
						data-testid="Profile__name"
					>
						{daoName}
						{isDaoVerified && <VerifyIcon />}
					</Title1>

					<div
						className="flex max-w-[min(370px,100%)] items-center justify-center gap-1 lg:justify-start"
						data-testid="Profile__wallet"
					>
						<Body className="truncate" color={colors.foregroundSecondary}>
							{publicLink}
						</Body>

						<button
							className="hover:bg-overlaySecondary flex h-6 w-6 items-center justify-center rounded-full"
							onClick={handleCopyLink}
						>
							<CopyIcon width={16} height={16} />
						</button>
					</div>

					{description && <CollapsableDescription description={description} />}

					<div className="mt-2 flex h-8 gap-2 lg:order-first lg:mt-0 lg:self-end">
						{collectionAddress && (
							<div className="flex items-center gap-2 lg:hidden">
								<IconButton
									className="rounded-full p-0"
									onClick={handleOpenPolygonScan(collectionAddress)}
									size="md"
									color="polygonScan"
									icon={<PolygonScanIcon width={32} height={32} />}
									data-testid="Profile__polygonScanButton"
								/>
								{hasAnySocialLink && <div className="bg-foregroundTertiary h-4 w-[0.5px]" />}
							</div>
						)}

						<SocialLinks
							twitter={twitter}
							discord={discord}
							telegram={telegram}
							instagram={instagram}
							site={site}
							onSocialLinkClick={handleSocialLinkClick}
						/>

						{handleProfileEdit && (
							<Button
								className="hidden lg:block"
								onClick={handleProfileEdit}
								color="backgroundTertiary"
								size="md"
								label={t('components.dao.actions.edit')}
							/>
						)}
					</div>

					<div className="flex w-full justify-center lg:mt-4 lg:justify-start">
						<div className="hidden flex-wrap items-end justify-start gap-3 lg:flex">
							<Button
								className="hidden lg:flex"
								onClick={toggleSharingModal}
								leftIcon={<ShareIcon width={16} height={16} fill="white" />}
								color="backgroundTertiary"
								size="md"
								label={t('actions.labels.share')}
								data-testid={'DaoProfile__shareButton'}
							/>
							{collectionAddress ? (
								<StyledButton
									className="max-h-8 px-3"
									leftIcon={<PolygonScanIcon />}
									color="backgroundTertiary"
									size="md"
									label={t('pages.dao.links.contract')}
									onClick={handleOpenPolygonScan(collectionAddress)}
									data-testid="DaoProfile__contractAddressButton"
								/>
							) : (
								<StyledButton
									label={t('pages.dao.labels.waitingConfirmationTemp')}
									color="backgroundTertiary"
									size="md"
									disabled
									data-testid="DaoProfile__noContractButton"
								/>
							)}

							{isCreator && (
								<StyledButton
									className="max-h-8"
									color="backgroundTertiary"
									size="md"
									label={t('pages.dao.links.support')}
									onClick={openSupportModal}
									data-testid="DaoProfile__supportButton"
								/>
							)}
						</div>

						{isJoinBlockAvailable && (
							<div className="mt-6 flex flex-wrap justify-center gap-3 self-end lg:mt-0 lg:ml-auto ">
								{shouldShowApplyToJoin && (
									<Button
										label={t('pages.dao.actions.apply')}
										size="lg"
										color="overlayTertiary"
										onClick={() => openExternal(whitelistUrl)}
									/>
								)}

								{shouldShowDaoJoin && canSeeWhitelistButton && (
									<DaoWhitelistJoin btnLabel={t('pages.dao.actions.apply')} whitelistUrl={whitelistUrl} />
								)}
							</div>
						)}
					</div>
				</main>
			</div>
		</>
	);
};

const StyledButton = styled(Button)`
	overflow: hidden;

	& > div {
		overflow: hidden;

		& > span {
			white-space: nowrap;
			width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
`;

export default memo(Head);
