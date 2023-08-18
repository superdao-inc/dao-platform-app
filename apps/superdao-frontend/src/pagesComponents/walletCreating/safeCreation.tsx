import { zodResolver } from '@hookform/resolvers/zod';
import { isAddress } from 'ethers/lib/utils';
import defaultTo from 'lodash/defaultTo';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import cn from 'classnames';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { Chain, getAddress, shrinkWallet } from '@sd/superdao-shared';
import {
	Body,
	Button,
	Caption,
	CheckIcon,
	CrossIcon,
	CustomSelect,
	DefaultSelectProps,
	IconButton,
	Input,
	Label,
	PlusIcon,
	PolygonIcon,
	SubHeading,
	Textarea,
	toast,
	UserAvatar
} from 'src/components';
import { NftToastContent as ToastContent } from 'src/components/toast/nftToastContent';
import { useDaoMembersQuery } from 'src/gql/daoMembership.generated';
import { useCreateWalletMutation, useTransactionQuery } from 'src/gql/wallet.generated';
import { useDeploySafe } from 'src/hooks';
import { useCheckChain } from 'src/hooks/useCheckChain';
import { CustomControl, CustomOption, selectStyles } from 'src/pagesComponents/treasury/shared/customSelectComponents';
import { StepProps } from 'src/pagesComponents/walletCreating/types';
import { DaoMemberRole, TreasuryWalletType } from 'src/types/types.generated';
import { safeSchema } from 'src/validators/wallets';
import { walletCreationSteps } from './constants';
import { StepsModal } from './modal';

import { colors } from 'src/style';
import { MetamaskError } from 'src/types/metamask';

const FormSchema = safeSchema.pick({
	walletName: true,
	description: true,
	owners: true,
	threshold: true
});

type FormFields = z.infer<typeof FormSchema>;

export const SafeCreationStep = (props: StepProps) => {
	const { isLoading, walletAddress, daoId, daoSlug } = props;
	const [hash, setHash] = useState('');
	const [step, setStep] = useState(walletCreationSteps.fillingForm);

	const { t } = useTranslation();
	const { push } = useRouter();
	const { isWrongChain } = useCheckChain(Chain.Polygon);

	const { data: safeTxData } = useTransactionQuery(
		{ address: walletAddress, hash, chainId: Chain.Polygon },
		{ enabled: !isEmpty(hash) }
	);
	const { data: daoAdmins } = useDaoMembersQuery({ daoId, roles: [DaoMemberRole.Creator, DaoMemberRole.Admin] });

	const ownersArr = daoAdmins?.daoMembers.items.map((item) =>
		pick(item.user, ['displayName', 'avatar', 'walletAddress', 'id'])
	);

	const { mutate: createWallet } = useCreateWalletMutation();

	const ownersOptions: DefaultSelectProps[] | undefined = ownersArr?.map(
		({ displayName, avatar, walletAddress, id }) => {
			const avatarImage = avatar ? getOptimizedFileUrl(avatar) : undefined;

			return {
				value: walletAddress,
				label: displayName || shrinkWallet(walletAddress),
				description: walletAddress,
				icon: <UserAvatar size="md" seed={id || undefined} src={avatarImage} />,
				controlIcon: <UserAvatar size="xs" seed={id || undefined} src={avatarImage} />
			};
		}
	);

	useEffect(() => {
		if (safeTxData && getAddress(safeTxData.transaction.tx.toAddress)) {
			setStep(walletCreationSteps.pending);
			setTimeout(() => {
				setStep(walletCreationSteps.adding);
				createWallet(
					{
						createWalletData: {
							daoId,
							name: walletName,
							description,
							address: defaultTo<string>(getAddress(safeTxData.transaction.tx.toAddress), ''),
							type: TreasuryWalletType.Safe
						}
					},
					{
						onSuccess: (params) => {
							if (!params?.createWallet) {
								throw new Error('some error');
							}
							setStep(walletCreationSteps.finishing);
							toast.success(<ToastContent title={t('toasts.createWallet.success.title')} />);
							push(`/${daoSlug}/treasury/wallets/${params.createWallet.id}?isNew=1`);
						},
						onError: () => {
							setStep(walletCreationSteps.fillingForm);
							toast.error(
								<ToastContent
									title={t('toasts.createWallet.failed.title')}
									description={t('toasts.createWallet.failed.description')}
								/>
							);
						}
					}
				);
			}, 10000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeTxData]);

	const {
		register,
		formState: { isValid, errors },
		control
	} = useForm<FormFields>({
		resolver: zodResolver(FormSchema),
		mode: 'onChange',
		defaultValues: {
			walletName: '',
			description: '',
			owners: [{ address: walletAddress }],
			threshold: 1
		}
	});

	const { fields, append: appendField, remove: removeField } = useFieldArray({ control, name: 'owners' });

	const owners = useWatch({
		control,
		name: 'owners'
	});

	const threshold = useWatch({
		control,
		name: 'threshold'
	});

	const walletName = useWatch({
		control,
		name: 'walletName'
	});

	const description = useWatch({
		control,
		name: 'description'
	});

	const ownersList = owners
		.filter(({ address }) => address != undefined && !isEmpty(address))
		.map(({ address }) => address);

	const onSafeDeployError = (e: any) => {
		setStep(walletCreationSteps.fillingForm);
		let metamaskErrorMessage = t(`errors.metamask.${(e as MetamaskError).code}`, '');

		toast.error(
			<ToastContent
				title={metamaskErrorMessage || t('toasts.createWallet.failed.title')}
				description={t('toasts.createWallet.failed.description')}
			/>
		);
	};

	const [createSafe, isSafeLoading] = useDeploySafe({ onError: (e) => onSafeDeployError(e) });

	const createNewSafe = useCallback(async () => {
		setStep(walletCreationSteps.signing);
		const data = await createSafe(
			owners.map(({ address }) => address),
			threshold
		);
		data.txHash && setHash(data.txHash);
	}, [createSafe, owners, threshold]);

	return (
		<>
			<div className={cn('flex flex-col items-start gap-4')}>
				<header className={cn('text-foregroundPrimary text-[36px] font-bold leading-[48px]')}>
					{t('components.treasury.createWallet.baseStep.title')}
				</header>
				<Input
					label={t('components.treasury.createWallet.baseStep.name.label')}
					placeholder={t('components.treasury.createWallet.baseStep.name.placeholder')}
					error={errors.walletName?.message ? ' ' : undefined}
					{...register('walletName')}
				/>
				{errors.walletName?.message && (
					<div className={cn('text-sfpro text-accentNegativeActive m-0 ml-4 block p-0 not-italic')}>
						{errors.walletName?.message}
					</div>
				)}

				<Textarea
					label={t('components.treasury.createWallet.baseStep.description.label')}
					placeholder={t('components.treasury.createWallet.baseStep.description.placeholder')}
					error={errors.description?.message ? ' ' : undefined}
					{...register('description')}
				/>
				{errors.description?.message && (
					<div className={cn('text-sfpro text-accentNegativeActive m-0 ml-4 block p-0 not-italic')}>
						{errors.description?.message}
					</div>
				)}

				<div>
					<Label className="mb-0 capitalize">{t('components.treasury.owners', { count: 2 })}</Label>
					<Caption color={colors.foregroundTertiary} className="mb-4">
						{t('components.treasury.createSafe.ownersCaption')}
					</Caption>

					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<div className={cn('mb-4 flex w-full items-center gap-[5px]')}>
								<Controller
									name={`owners.${index}.address`}
									control={control}
									rules={{ required: true }}
									render={({ field: { name, value, onChange, ref } }) => (
										<CustomSelect
											styles={selectStyles}
											innerRef={ref}
											onChange={({ value: newValue }) => onChange(newValue?.value)}
											name={name}
											isClearable
											value={ownersOptions?.find((item) => item.value === value)}
											noOptionsMessage={() => 'No users'}
											createLabel="Add"
											components={{
												Option: CustomOption,
												Control: CustomControl,
												DropdownIndicator: () => (value ? <CheckIcon fill={colors.accentPositive} /> : null),
												ClearIndicator: undefined
											}}
											options={ownersOptions?.filter((item) => !ownersList.includes(item.value))}
											className="min-w-[530px]"
											placeholder="Wallet address"
											isCreatable
											isDisabled={value === walletAddress}
											isValidNewOption={(input) => isAddress(input)}
										/>
									)}
								/>

								<IconButton
									color="transparent"
									size="md"
									onClick={() => removeField(index)}
									icon={<CrossIcon />}
									disabled={index === 0}
								/>
							</div>
						</Fragment>
					))}
				</div>
				<div className="mt-[-16px] flex items-center gap-3">
					<IconButton
						color="backgroundTertiary"
						size="lg"
						onClick={() => appendField({ address: '' })}
						className="rounded-full"
						icon={<PlusIcon width={20} height={20} />}
					/>
					<Label className="mb-0">{t('components.treasury.createSafe.addOwner')}</Label>
				</div>
				<div className="flex w-[68px] items-center gap-3 whitespace-nowrap">
					<Input
						label={t('components.treasury.createSafe.thresholdLabel')}
						className="w-[36px]"
						error={threshold > ownersList.length || threshold === 0 ? ' ' : undefined}
						{...register('threshold', {
							valueAsNumber: true,
							validate: (value) => value > ownersList.length || value != 0
						})}
					/>

					<Body className="mt-7" color={colors.foregroundTertiary}>
						{t('components.treasury.createSafe.numberOfOwners', {
							count: ownersList.length
						})}
					</Body>
				</div>
				{(threshold > ownersList.length || threshold === 0) && (
					<div className={cn('text-sfpro text-accentNegativeActive m-0 ml-4 block p-0 not-italic')}>
						{t('components.treasury.createSafe.thresholdError')}
					</div>
				)}
				<div className="mt-3 flex items-center gap-4">
					<Button
						color="accentPrimary"
						size="lg"
						onClick={createNewSafe}
						disabled={!isValid || isLoading || isWrongChain}
						isLoading={isSafeLoading || isLoading}
						label={t('actions.labels.create')}
					/>
					<div className="flex items-center gap-1">
						<PolygonIcon width={14} height={12} fill={colors.foregroundSecondary} />
						<SubHeading color={colors.foregroundSecondary}>
							{t('components.treasury.createSafe.polygonHint')}
						</SubHeading>
					</div>
				</div>
			</div>
			{step !== walletCreationSteps.fillingForm && isSafeLoading && (
				<StepsModal isOpen={step !== 0 && isSafeLoading} step={step} />
			)}
		</>
	);
};
