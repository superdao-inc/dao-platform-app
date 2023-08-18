import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoWithRoles, getUserByIdOrSlug, getWallet } from 'src/client/commonRequests';
import { useUpdateWalletMutation, useWalletQuery } from 'src/gql/wallet.generated';
import { NftToastContent as ToastContent } from 'src/components/toast/nftToastContent';
import { PageContent, toast } from 'src/components';
import { CustomHead } from 'src/components/head';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { Button, Input, Textarea } from 'src/components';
import { FormWrapper } from 'src/pagesComponents/walletCreating/formWrapper';
import { walletSchema } from 'src/validators/wallets';
import { useTreasuryQuery } from 'src/gql/treasury.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { getAddress } from '@sd/superdao-shared';
import { DaoMemberRole } from 'src/types/types.generated';

const FormSchema = walletSchema.pick({
	name: true,
	description: true
});

type Props = {
	slug: string;
	id: string;
	daoId: string;
};

type FormFields = z.infer<typeof FormSchema>;

const CreateWallet: NextPageWithLayout<Props> = (props) => {
	const { t } = useTranslation();
	const { push, query } = useRouter();

	const { slug, id, daoId } = props;
	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};
	const { data: walletData, refetch } = useWalletQuery({ id });
	const { refetch: refetchWallets } = useTreasuryQuery({
		daoId
	});

	const handleClose = () => {
		const from = typeof query.from === 'string' ? query.from : '';

		if (from) {
			push(from);
		} else {
			push(`/${slug}/treasury`);
		}
	};

	const {
		register,
		handleSubmit,
		formState: { isValid, errors }
	} = useForm<FormFields>({
		resolver: zodResolver(FormSchema),
		mode: 'onChange'
	});

	const { mutate: editWallet } = useUpdateWalletMutation();

	const onWalletEdit = ({ name, description }: { name: string; description: string }) => {
		editWallet(
			{ updateWalletData: { id, name, description } },
			{
				onSuccess: () => {
					refetchWallets();
					refetch();
					setTimeout(() => handleClose(), 1000);
					toast.success(<ToastContent title={t('toasts.updateWallet.success.title')} />);
				},
				onError: () => {
					toast.error(
						<ToastContent
							title={t('toasts.removeWallet.failed.title')}
							description={t('toasts.removeWallet.failed.description')}
						/>
					);
				}
			}
		);
	};

	return (
		<PageContent columnSize="sm">
			<CustomHead
				main={daoData?.name ?? ''}
				additional={'Wallet editing'}
				description={daoData?.description ?? ''}
				avatar={daoData?.avatar ?? null}
			/>

			<div className="flex h-full flex-col justify-center pt-[72px]" data-testid={'EditWalletForm__wrapper'}>
				<FormWrapper title={t('components.treasury.editWallet.title')} onSubmit={handleSubmit(onWalletEdit)}>
					<Input
						label={t('components.treasury.createWallet.baseStep.name.label')}
						placeholder={t('components.treasury.createWallet.baseStep.name.placeholder')}
						error={errors.name?.message}
						defaultValue={walletData?.wallet.name}
						{...register('name')}
					/>

					<Textarea
						label={t('components.treasury.createWallet.baseStep.description.label')}
						placeholder={t('components.treasury.createWallet.baseStep.description.placeholder')}
						error={errors.description?.message}
						defaultValue={walletData?.wallet.description || undefined}
						{...register('description')}
					/>

					<Button
						className="mt-3"
						color="accentPrimary"
						size="lg"
						type="submit"
						disabled={!isValid}
						label={t('actions.labels.save')}
						data-testid={'EditWalletFrom__saveButton'}
					/>
				</FormWrapper>
			</div>
		</PageContent>
	);
};

CreateWallet.getLayout = getDaoLayout;

export default CreateWallet;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	const id = ctx.params?.id;

	if (typeof slug !== 'string' || typeof id !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const user = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: userID });
	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!userAsMember?.role) return { notFound: true };

	try {
		const wallet = await getWallet(queryClient, ctx, { id });

		if (!wallet) {
			return { notFound: true };
		}

		if (wallet.main) {
			return { notFound: true };
		}

		if (getAddress(wallet.address) !== getAddress(user?.walletAddress) && userAsMember.role === DaoMemberRole.Member) {
			return { notFound: true };
		}
	} catch (e) {
		return { notFound: true };
	}
	return {
		props: {
			slug: dao.slug,
			id,
			daoId: dao.id,
			...getProps()
		}
	};
});
