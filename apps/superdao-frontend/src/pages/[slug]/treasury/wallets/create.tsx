import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { TreasuryWalletType } from 'src/types/types.generated';
import { useCreateWalletMutation } from 'src/gql/wallet.generated';
import { CreateWalletRequest } from 'src/validators/wallets';
import { BaseStep } from 'src/pagesComponents/walletCreating/baseStep';
import { DefaultValuesType } from 'src/pagesComponents/walletCreating/types';
import { ConnectWallet } from 'src/pagesComponents/walletCreating/connectWalletStep';
import { NftToastContent as ToastContent } from 'src/components/toast/nftToastContent';
import { PageContent, toast } from 'src/components';
import { CustomHead } from 'src/components/head';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	walletAddress: string;
	hasAdminRights: boolean;
};

const steps = [ConnectWallet, BaseStep];

const CreateWallet: NextPageWithLayout<Props> = (props) => {
	const { daoId, slug, walletAddress, hasAdminRights } = props;

	const { push } = useRouter();
	const { t } = useTranslation();

	const [currentStep, setCurrentStep] = useState(0);

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};

	const { mutate: createWallet } = useCreateWalletMutation();

	const [defaultValues, setDefaultValues] = useState<DefaultValuesType>({
		address: '',
		type: TreasuryWalletType.External
	});
	const [walletType, setWalletType] = useState<TreasuryWalletType>(TreasuryWalletType.External);

	const handleStepSubmit = (data: CreateWalletRequest) => {
		if (currentStep === steps.length - 1) {
			const { name, description, address } = data;

			createWallet(
				{
					createWalletData: {
						daoId,
						name,
						description,
						address,
						type: walletType
					}
				},
				{
					onSuccess: (params) => {
						if (!params?.createWallet) {
							throw new Error('some error');
						}

						toast.success(<ToastContent title={t('toasts.createWallet.success.title')} />);
						push(`/${slug}/treasury/wallets/${params.createWallet.id}?isNew=1`);
					},
					onError: () => {
						toast.error(
							<ToastContent
								title={t('toasts.createWallet.failed.title')}
								description={t('toasts.createWallet.failed.description')}
							/>
						);
					}
				}
			);

			return;
		}

		setCurrentStep((step) => step + 1);
	};

	const StepComponent = steps[currentStep];

	const handleStepSuccess = (params: DefaultValuesType) => {
		setWalletType(params.type);
		setDefaultValues(params);

		setCurrentStep((step) => step + 1);
	};

	return (
		<PageContent columnSize="sm">
			<CustomHead
				main={daoData?.name ?? ''}
				additional={'Wallet creation'}
				description={daoData?.description ?? ''}
				avatar={daoData?.avatar ?? null}
			/>

			<div className="flex h-full flex-col justify-center pt-[72px]">
				<StepComponent
					isLoading={false}
					daoSlug={slug}
					onStepSuccess={handleStepSuccess}
					onSubmit={handleStepSubmit}
					params={defaultValues}
					hasAdminRights={hasAdminRights}
					{...{ walletAddress, daoId }}
				/>
			</div>
		</PageContent>
	);
};

CreateWallet.getLayout = getDaoLayout;

export default CreateWallet;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const { currentUser } = ctx;
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!Boolean(userAsMember?.role)) return { notFound: true };

	const hasAdminRights = isAdmin(userAsMember?.role);

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			walletAddress: currentUser?.walletAddress,
			hasAdminRights,
			...getProps()
		}
	};
});
