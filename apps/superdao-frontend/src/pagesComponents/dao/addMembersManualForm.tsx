import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import cn from 'classnames';

import { isAddress } from 'ethers/lib/utils';
import {
	Button,
	CheckIcon,
	Input,
	Label1,
	Label3,
	NftToastContent,
	PlusIcon,
	toast,
	UserAvatar as WalletAvatar
} from 'src/components';
import { BlockchainButton } from 'src/components/blockchain-button';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { colors } from 'src/style';
import { airdropKey, whitelistKey } from 'src/utils/toastKeys';
import { NftTier } from 'src/types/types.generated';
import { socketConnection } from 'src/components/socketProvider';
import { EMAIL_REGEX, getDefinedValues, isENS, isUniqueStringList } from '@sd/superdao-shared';
import {
	SelectNftField,
	FormType,
	ManualFormProps,
	useAddSelectNft,
	getSelectTiersMapper,
	usePrepareSelectTiersOption
} from './nftSelect';

export type Props = {
	isWhitelistMode?: boolean;
	daoId: string;
	daoSlug: string;
	daoAddress: string;
};

export const AddMembersManualForm = (props: Props) => {
	const { t } = useTranslation();
	const { daoId, daoAddress, isWhitelistMode } = props;

	const { query } = useRouter();

	const isAirdropByEmailMode = useMemo(() => Boolean(query.isAirdropByEmail), [query]);

	const emailFieldPlaceholder = isAirdropByEmailMode
		? t('pages.dao.addMembersManually.email.claim')
		: t('pages.dao.addMembersManually.email.notification');

	const { data: collectionData, isLoading: isCollectionDataLoading } = useNftCollectionQuery({ daoAddress });
	const tiers = collectionData?.collection?.tiers.filter((t) => !t.isDeactivated) || [];
	const formType = isWhitelistMode ? FormType.whitelist : FormType.airdrop;

	const options = usePrepareSelectTiersOption<NftTier>({
		options: tiers ?? [],
		optionsMapper: getSelectTiersMapper
	});

	const { isLoading, isSuccess, handleSend, titleKey, description } = useAddSelectNft({
		formType,
		tiers,
		options,
		daoId,
		daoAddress
	});

	const form = useForm<ManualFormProps>({
		mode: 'onChange',
		defaultValues: { members: [{ walletAddress: '', tiers: [''], email: '' }] }
	});

	const { handleSubmit, control, formState, getValues, trigger, register } = form;

	const data = getValues();

	const { isDirty, isValid, errors, dirtyFields } = formState;

	const { fields, append, remove } = useFieldArray({ control, name: 'members' });

	const onSubmit = (data: ManualFormProps) => {
		if (!isUniqueStringList(getDefinedValues(data.members, ({ email }) => email))) {
			toast.error(t('toasts.hasDuplicatedEmails'));
			return;
		}

		const toastId = isWhitelistMode ? whitelistKey(daoId) : airdropKey(daoId);

		toast.loading(<NftToastContent title={t(titleKey, { count: data?.members?.length })} description={description} />, {
			position: 'bottom-center',
			id: toastId
		});

		handleSend({ data });
	};

	const [isButtonDisabled, setIsButtonDisabled] = useState(true);

	const [isTxActive, setTxActive] = useState(false);

	const isBtnDisabled = useMemo(() => {
		if (!isDirty) return true;

		const areThereWalletsWithoutAddress = data.members.some((member) =>
			isWhitelistMode ? !member.walletAddress : !member.email && !member.walletAddress
		);

		const hasTier = data.members.every((member) => {
			return member.tiers.filter((value) => value.length).length;
		});
		return isTxActive || areThereWalletsWithoutAddress || !hasTier || !isValid;
	}, [isDirty, data, isTxActive, isValid, isWhitelistMode]);

	useEffect(() => {
		setIsButtonDisabled(isBtnDisabled);
	}, [isBtnDisabled]);

	useEffect(() => {
		/**
		 * watch не работает на изменения fields, соотвественно эта проверка сделает кнопку недоступной при добавлении мембера
		 */
		const hasMemberWithoutTier = fields.some((member) => !member?.tiers);
		const hasMemberWithoutAddress = fields.some((member) => !member.email && !member.walletAddress);

		const bool = isTxActive || hasMemberWithoutTier || hasMemberWithoutAddress || !fields.length;
		setIsButtonDisabled(bool);
	}, [fields, isTxActive]);

	useEffect(() => {
		if (isSuccess) {
			setIsButtonDisabled(true);
			setTxActive(true);
		}
	}, [isSuccess]);

	useEffect(() => {
		socketConnection?.onAny(() => {
			setIsButtonDisabled(false);
			setTxActive(false);
		});
	}, []);

	const whitelistButtonText = fields.length
		? t('modals.tierManager.whitelist.action.addWalletWithCount', { count: fields.length })
		: t('modals.tierManager.whitelist.action.addWallet');

	const airdropButtonText = fields.length
		? t('modals.tierManager.airdrop.action.sendNftWithCount', { count: fields.length })
		: t('modals.tierManager.airdrop.action.sendNft');

	return (
		<form className={isWhitelistMode ? 'mt-6' : ''} onSubmit={handleSubmit(onSubmit)}>
			{fields.map((field, index) => (
				<div className="mb-5" key={field.id}>
					<div className="flex items-center justify-between">
						<div className="flex items-center justify-between">
							<Label1>{t('roles.member')}</Label1>
							<Label1 className="ml-2" color={colors.foregroundTertiary}>
								{index + 1}
							</Label1>
						</div>

						{fields.length > 1 && (
							<Label3 className="cursor-pointer" color={colors.accentNegative} onClick={() => remove(index)}>
								{t('actions.labels.remove')}
							</Label3>
						)}
					</div>

					<div className="mt-4 flex flex-wrap justify-between gap-4 lg:mt-2 lg:gap-4">
						{!isAirdropByEmailMode ? (
							<Input
								errorClassName="static"
								leftIcon={
									(isAddress(field.walletAddress) || isENS(field.walletAddress)) && (
										<WalletAvatar seed={field.walletAddress} size="xs" />
									)
								}
								rightIcon={
									(isAddress(field.walletAddress) || isENS(field.walletAddress)) && (
										<CheckIcon fill={colors.accentPositive} />
									)
								}
								placeholder={t('components.user.wallet.addressLabel')}
								{...register(`members.${index}.walletAddress`, {
									required: !isAirdropByEmailMode,
									validate: (value: string) => (!!value ? isAddress(value) || isENS(value) : undefined)
								})}
								defaultValue={field.walletAddress}
								error={
									field.walletAddress && !(isAddress(field.walletAddress) || isENS(field.walletAddress))
										? t('modals.tierManager.invalidAddressError')
										: undefined
								}
							/>
						) : null}

						<div className="flex w-full flex-wrap gap-4 lg:flex-nowrap">
							<div className={cn('w-full lg:flex-1', isAirdropByEmailMode ? 'order-2' : 'order-1')}>
								<Controller
									name={`members.${index}.tiers`}
									control={control}
									render={({ field: selectField }) => (
										<SelectNftField
											formType={formType}
											trigger={trigger}
											isLoading={isCollectionDataLoading}
											options={options}
											{...selectField}
										/>
									)}
								/>
							</div>

							<div className={cn('w-full lg:flex-1', isAirdropByEmailMode ? 'order-1' : 'order-2')}>
								<Input
									placeholder={emailFieldPlaceholder}
									rightIcon={
										!errors?.members?.[index]?.email &&
										dirtyFields?.members?.[index]?.email && <CheckIcon fill={colors.accentPositive} />
									}
									{...register(`members.${index}.email`, {
										required: isAirdropByEmailMode,
										pattern: {
											value: EMAIL_REGEX,
											message: t('pages.dao.addMembersManually.invalidEmail')
										}
									})}
									error={errors?.members?.[index]?.email?.message}
								/>
							</div>
						</div>
					</div>
				</div>
			))}

			<Button
				size="lg"
				className="!p-0"
				label={
					<div className="flex items-center">
						<div className="bg-backgroundSecondary mr-4 grid h-10 w-10 place-content-center rounded-full">
							<PlusIcon width={24} height={24} fill={colors.foregroundSecondary} />
						</div>
						{t('pages.dao.addMembersManually.actions.addOneMore')}
					</div>
				}
				color="transparent"
				type="button"
				onClick={() => append({ walletAddress: '', tiers: [''], email: '' })}
			/>

			<BlockchainButton
				className="mt-5 lg:mt-10"
				size="lg"
				color="accentPrimary"
				label={isWhitelistMode ? whitelistButtonText : airdropButtonText}
				type="submit"
				disabled={isButtonDisabled || isLoading}
				isLoading={isLoading}
			/>
		</form>
	);
};
