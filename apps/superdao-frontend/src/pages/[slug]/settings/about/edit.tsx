import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from 'react-query';

import { ChangeEvent, useCallback, useState } from 'react';
import { useDebounce, useSwitch } from 'src/hooks';
import {
	DaoBySlugQuery,
	useCheckDaoSlugQuery,
	useDaoBySlugQuery,
	useDaoBySlugWithRolesQuery,
	useUpdateDaoMutation
} from 'src/gql/daos.generated';

import {
	AvatarUploader,
	Button,
	CoverUploader,
	DaoDocsFields,
	Input,
	InstagramIcon,
	Label1,
	PageContent,
	PolygonScanIcon,
	Textarea,
	Title1,
	Title3
} from 'src/components';
import { DiscordIcon, ExternalLinkIcon, LinkIcon, TelegramIcon, TwitterIcon } from 'src/components/assets/icons';
import { SupportModal } from 'src/components/modals/supportModal';
import { CustomHead } from 'src/components/head';
import { openPolygonScanByAddressAsExternal } from 'src/utils/urls';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import {
	createDaoRequest,
	createDaoShortSlugRequest,
	DaoFields,
	daoSchema,
	daoWithShortSlugSchema
} from 'src/validators/daos';

import { getPathnameFromUrl, SLUG_MIN_LENGTH, shrinkWallet } from '@sd/superdao-shared';
import { useUserDaoParticipationQuery } from 'src/gql/user.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { UserAPI } from 'src/features/user';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';
import { MobileHeader } from 'src/components/mobileHeader';
import { SettingsNavigation } from 'src/pagesComponents/settings/navigation';

type Props = {
	slug: string;
	daoId: string;
	hostname: string;
};

const DaoEdit: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId, hostname } = props;

	const { back, push } = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { data: dao } = useDaoBySlugQuery({ slug });
	const { daoBySlug: daoData } = dao || {};

	const { data: collectionData } = useNftCollectionQuery(
		{ daoAddress: daoData?.contractAddress! },
		{ enabled: !!daoData?.contractAddress }
	);

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};

	const getTierVotingWeightsValues = useCallback(() => {
		const res =
			!!collectionData && daoData?.tiersVotingWeights
				? collectionData.collection.tiers.map((tier) => {
						const currentTier = daoData.tiersVotingWeights.find(
							(tierVotingWeight) => tierVotingWeight.tierId === tier.id
						);

						return { tierId: tier.id, weight: currentTier && currentTier.weight != undefined ? currentTier.weight : 1 };
				  })
				: [];

		return res;
	}, [collectionData, daoData]);

	/**
	 * isValidated flag for disabling submit btn before validation is finised
	 */
	const [isValidated, setIsValidated] = useState(true);

	const [isCustomizeSmartContractModalOpen, { off: closeCustomizeModal, on: openCustomizeModal }] = useSwitch(false);
	const { register, control, handleSubmit, formState, setValue, watch, setError, getValues } = useForm<DaoFields>({
		// it may not be obvious, but there is always correct information about dao access to short slug feature
		resolver: zodResolver(dao?.daoBySlug?.hasShortSlugAccess ? daoWithShortSlugSchema : daoSchema),
		mode: 'onChange',
		defaultValues: {
			...daoData,
			site: daoData?.links.site,
			telegram: getPathnameFromUrl(daoData?.links.telegram),
			instagram: getPathnameFromUrl(daoData?.links.instagram),
			discord: getPathnameFromUrl(daoData?.links.discord),
			twitter: getPathnameFromUrl(daoData?.links.twitter),
			documents: Number(daoData?.documents.length) > 0 ? daoData?.documents : [{}, {}],
			tiersVotingWeights: getTierVotingWeightsValues()
		}
	});

	const watchedSlug = useDebounce(watch('slug'), 1000);

	const { mutate, isLoading } = useUpdateDaoMutation();
	const { isLoading: isCheckingSlug } = useCheckDaoSlugQuery(
		{
			slug: watchedSlug
		},
		{
			onSuccess: ({ checkDaoSlug: { isAvailable } }) => {
				if (!isAvailable && (getValues('slug').length >= SLUG_MIN_LENGTH || dao?.daoBySlug?.hasShortSlugAccess)) {
					return setError('slug', { message: t('errors.validation.slug') });
				}

				setIsValidated(true);
			},
			onError: () => {
				if (getValues('slug').length >= SLUG_MIN_LENGTH || dao?.daoBySlug?.hasShortSlugAccess)
					setError('slug', { message: t('errors.validation.slug') });
			},
			enabled:
				(watchedSlug?.length >= SLUG_MIN_LENGTH || dao?.daoBySlug?.hasShortSlugAccess) && daoData?.slug !== watchedSlug
		}
	);

	const onSubmit = handleSubmit((data) => {
		const request = dao?.daoBySlug?.hasShortSlugAccess
			? createDaoShortSlugRequest.parse(data)
			: createDaoRequest.parse(data);

		const tiersVotingWeights = request.tiersVotingWeights;

		mutate(
			{
				updateDaoData: {
					...request,
					id: daoId,
					ensDomain: daoData?.ensDomain,
					documents: request.documents.filter((document) => document.name && document.url),
					tiersVotingWeights: tiersVotingWeights
				}
			},
			{
				onSuccess: (params) => {
					queryClient.setQueryData<DaoBySlugQuery>(useDaoBySlugQuery.getKey({ slug }), { daoBySlug: params.updateDao });
					queryClient.refetchQueries(useUserDaoParticipationQuery.getKey({ userId: userData!.id }));

					// used for update dao data without reload
					queryClient.invalidateQueries(useDaoBySlugWithRolesQuery.getKey({ slug }));

					push(`/${params.updateDao.slug}`);
				},
				onError: (err) => {}
			}
		);
	});

	const onChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const slug = event.target.value.toLowerCase();

			if (daoData?.slug !== slug) {
				setIsValidated(false);
			} else {
				setIsValidated(true);
			}

			setValue('slug', slug);
		},
		[setValue, daoData?.slug]
	);

	if (!daoData || !userData) return null;

	const { id, avatar, cover, contractAddress, name, description } = daoData;
	const { isValid, errors } = formState;
	const disabledSubmit = !isValid || isLoading || !isValidated;

	const handleBack = () => back();
	const handleOpenPolygonScan = (address: string) => () => openPolygonScanByAddressAsExternal(address);

	return (
		<PageContent columnSize="sm">
			<CustomHead main={name} additional={'Settings'} description={description} avatar={avatar} />

			<Title1 className="mb-6 hidden lg:block">{t('pages.editDao.title')}</Title1>
			<MobileHeader title={t('pages.editDao.title')} onBack={handleBack} />
			<SettingsNavigation slug={slug} />
			<SupportModal isOpen={isCustomizeSmartContractModalOpen} onClose={closeCustomizeModal} />

			<Form onSubmit={onSubmit} className="mt-2" autoComplete={'off'}>
				<div className="flex w-full flex-col-reverse gap-7 lg:flex-row">
					<AvatarUploader
						label={t('upload.avatarLabel')}
						seed={id}
						onChange={(file) => setValue('avatar', file)}
						currentAvatar={avatar}
					/>

					<CoverUploader
						label={t('upload.coverLabel')}
						seed={id}
						onChange={(file) => setValue('cover', file)}
						currentCover={cover}
					/>
				</div>

				<Input
					label={t('components.dao.name.label')}
					placeholder={t('components.dao.name.placeholder')}
					error={errors.name?.message}
					{...register('name')}
				/>

				<Textarea
					label={t('components.dao.description.label')}
					placeholder={t('components.dao.description.placeholder')}
					error={errors.description?.message}
					{...register('description')}
				/>

				<div className="mt-2 w-full" id="docs">
					<DaoDocsFields register={register} control={control} errors={errors} />
				</div>

				<div className="mt-2 w-full">
					<Title3 className="mb-2">{t('components.dao.smartContract.label')}</Title3>

					<div className="flex w-full gap-3">
						{contractAddress && (
							<Button
								className="justify-start px-3"
								leftIcon={<PolygonScanIcon />}
								rightIcon={<ExternalLinkIcon />}
								label={shrinkWallet(contractAddress)}
								color="overlaySecondary"
								size="lg"
								type="button"
								onClick={handleOpenPolygonScan(contractAddress)}
							/>
						)}

						<Button
							className="px-6 py-2"
							label={t('actions.labels.support')}
							color="overlaySecondary"
							size="lg"
							type="button"
							onClick={openCustomizeModal}
						/>
					</div>
				</div>

				<Input
					label={t('components.dao.whitelist.label')}
					placeholder={t('components.dao.whitelist.placeholder')}
					error={errors.whitelistUrl?.message}
					{...register('whitelistUrl')}
				/>

				<Input
					label={t('components.dao.publicLink.label')}
					prefix={`${hostname}/`}
					prefixClassName="max-w-[120px]"
					className="w-full"
					isLoading={isCheckingSlug}
					error={errors.slug?.message}
					{...register('slug', { onChange })}
				/>

				<div className="w-full">
					<Label1 className="mb-2">{t('components.dao.socialLinks.label')}</Label1>

					<Links>
						<Input
							leftIcon={<LinkIcon width={20} height={20} className="fill-foregroundSecondary" />}
							placeholder={t('components.dao.links.website')}
							className="w-full"
							{...register('site')}
						/>
						<Input
							leftIcon={<TwitterIcon width={20} height={20} className="fill-foregroundSecondary" />}
							placeholder="username"
							prefix="twitter.com/"
							prefixClassName="max-w-[130px]"
							className="w-full"
							{...register('twitter')}
						/>
						<Input
							leftIcon={<InstagramIcon width={20} height={20} className="fill-foregroundSecondary" />}
							placeholder="username"
							prefix="instagram.com/"
							prefixClassName="max-w-[130px]"
							className="w-full"
							{...register('instagram')}
						/>
						<Input
							leftIcon={<DiscordIcon width={20} height={20} className="fill-foregroundSecondary" />}
							placeholder="invitation code"
							prefix="discord.com/invite/"
							prefixClassName="max-w-[130px]"
							className="w-full"
							{...register('discord')}
						/>
						<Input
							leftIcon={<TelegramIcon width={20} height={20} className="fill-foregroundSecondary" />}
							placeholder="username"
							prefix="t.me/"
							prefixClassName="max-w-[130px]"
							className="w-full"
							error={(errors.site || errors.twitter || errors.instagram || errors.discord || errors.telegram)?.message}
							{...register('telegram')}
						/>
					</Links>
				</div>

				<div className="bg-backgroundPrimary fixed bottom-0 left-0 w-full py-6 lg:relative lg:mb-0 lg:w-auto lg:py-0">
					<Button
						color="accentPrimary"
						size="lg"
						type="submit"
						label={t('actions.labels.saveChanges')}
						disabled={disabledSubmit}
						data-testid="DaoEdit__saveButton"
						className="mx-4 w-[calc(100%-32px)] lg:mx-0 lg:w-auto"
					/>
				</div>
			</Form>
		</PageContent>
	);
};

DaoEdit.getLayout = getDaoLayout;

export default DaoEdit;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!isAdmin(userAsMember?.role)) return { notFound: true };

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			...getProps()
		}
	};
});

const Form = styled.form`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 24px;
`;

const Links = styled.fieldset`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;

	margin: 0;
	padding: 0;
	border: none;
`;
