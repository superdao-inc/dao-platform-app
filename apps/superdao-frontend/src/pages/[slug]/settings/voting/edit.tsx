import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import copy from 'clipboard-copy';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { MouseEventHandler, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import {
	Button,
	CopyIcon,
	DaoTiersVotingWeights,
	IconButton,
	Label1,
	PageContent,
	SubHeading,
	Textarea,
	Title1,
	Title3,
	toast
} from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { EnsBlock } from 'src/features/dao-edit/ensBlock';
import { UserAPI } from 'src/features/user';
import { DaoBySlugQuery, useDaoBySlugQuery, useUpdateDaoVotingMutation } from 'src/gql/daos.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { useUserDaoParticipationQuery } from 'src/gql/user.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { SettingsNavigation } from 'src/pagesComponents/settings/navigation';

import { colors } from 'src/style/variables';
import { isAdmin } from 'src/utils/roles';
import { createVotingRequest, VotingFields, votingSchema } from 'src/validators/daos';

type Props = {
	slug: string;
	daoId: string;
	hostname: string;
};

const getSnapshotConfig = (contractAddress?: string | null, collectionAddress?: string | null) => {
	if (!contractAddress || !collectionAddress) return '';
	return JSON.stringify(
		{
			symbol: 'VOTES',
			address: collectionAddress,
			metadataSrc: `https://app.superdao.co/api/collection_tokens_voting_weights?dao_address=${contractAddress}`
		},
		null,
		4
	);
};

const DaoEdit: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId } = props;

	const { back } = useRouter();
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

	const snapshotConfig = getSnapshotConfig(daoData?.contractAddress, collectionData?.collection.collectionAddress);

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

	const { register, control, handleSubmit, formState, reset } = useForm<VotingFields>({
		resolver: zodResolver(votingSchema),
		mode: 'onChange',
		defaultValues: {
			tiersVotingWeights: getTierVotingWeightsValues()
		}
	});

	// need reseting values after ssr
	useEffect(() => {
		reset({
			tiersVotingWeights: getTierVotingWeightsValues()
		});
	}, [reset, getTierVotingWeightsValues]);

	const { mutate, isLoading } = useUpdateDaoVotingMutation();
	const handleCopy: MouseEventHandler = (e) => {
		e.preventDefault();
		copy(snapshotConfig).then(() =>
			toast.success(t('actions.confirmations.configurationCopy'), { id: 'configuration-copy' })
		);
	};
	const onSubmit = handleSubmit((data) => {
		const request = createVotingRequest.parse(data);

		const tiersVotingWeights = request.tiersVotingWeights;

		mutate(
			{
				updateVotingData: {
					...request,
					id: daoId,
					tiersVotingWeights: tiersVotingWeights
				}
			},
			{
				onSuccess: (params) => {
					queryClient.setQueryData<DaoBySlugQuery>(useDaoBySlugQuery.getKey({ slug }), {
						daoBySlug: params.updateDaoVoting
					});
					queryClient.refetchQueries(useUserDaoParticipationQuery.getKey({ userId: userData!.id }));
					toast(t('components.dao.settings.voting.saved'));
				},
				onError: (err) => {}
			}
		);
	});

	if (!daoData || !userData) return null;

	const { avatar, ensDomain, name, description } = daoData;
	const { isValid, errors } = formState;
	const disabledSubmit = !isValid || isLoading;

	const handleBack = () => back();

	return (
		<PageContent columnSize="sm">
			<CustomHead main={name} additional={'Settings'} description={description} avatar={avatar} />

			<Title1 className="mb-6 hidden lg:block">{t('pages.editDao.title')}</Title1>
			<MobileHeader title={t('pages.editDao.title')} onBack={handleBack} />
			<SettingsNavigation slug={slug} />
			<Form onSubmit={onSubmit} className="mt-2 pb-[88px] lg:pb-6" autoComplete={'off'}>
				<div className="mt-2 w-full">
					<Title3 className="mb-2">{t('components.dao.voting.label')}</Title3>

					<EnsBlock ensDomain={ensDomain} daoId={daoId} slug={slug} />
				</div>
				{daoData.isVotingEnabled && daoData.contractAddress && collectionData ? (
					<>
						<div className="mt-2 w-full">
							<DaoTiersVotingWeights
								register={register}
								control={control}
								errors={errors}
								tiersInfo={collectionData.collection.tiers}
							/>
						</div>
						<div>
							<Label1>{t('components.dao.settings.voting.snapshotSettings')}</Label1>
							<SubHeading color={colors.foregroundSecondary}>
								{t('components.dao.settings.voting.hint.settings')}
								<b>{t('components.dao.settings.voting.hint.strategy')}</b>
							</SubHeading>
						</div>
						<div className="relative  w-full">
							<Textarea
								// @ts-ignore
								readOnly
								className="font-[SF Mono] overflow-hidden break-all"
								value={snapshotConfig}
							/>
							<IconButton
								className="absolute top-0 right-0"
								onClick={handleCopy}
								color="transparent"
								icon={<CopyIcon width={20} height={20} />}
								size="lg"
							/>
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
					</>
				) : null}
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
