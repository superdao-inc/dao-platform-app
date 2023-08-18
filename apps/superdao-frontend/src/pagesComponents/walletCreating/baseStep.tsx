import { useTranslation } from 'next-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAddress } from 'ethers/lib/utils';
import isEmpty from 'lodash/isEmpty';
import { Button, Input, Textarea, UserAvatar as WalletAvatar, CheckIcon } from 'src/components';
import { StepProps } from 'src/pagesComponents/walletCreating/types';
import { FormWrapper } from 'src/pagesComponents/walletCreating/formWrapper';
import { walletSchema } from 'src/validators/wallets';
import { colors } from 'src/style';
import { TreasuryWalletType } from 'src/types/types.generated';
import { SafeCreationStep } from './safeCreation';

const FormSchema = walletSchema.pick({
	name: true,
	description: true,
	address: true
});

type FormFields = z.infer<typeof FormSchema>;

export const BaseStep = (props: StepProps) => {
	const { params } = props;

	if (params.type === TreasuryWalletType.Safe && isEmpty(params.address)) {
		return <SafeCreationStep {...props} />;
	}
	return <WalletCreationStep {...props} />;
};

const WalletCreationStep = (props: StepProps) => {
	const { t } = useTranslation();
	const { onSubmit, isLoading, params } = props;

	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		control
	} = useForm<FormFields>({
		resolver: zodResolver(FormSchema),
		mode: 'onChange',
		defaultValues: {
			address: params.address,
			name: '',
			description: ''
		}
	});

	const address = useWatch({
		control,
		name: 'address'
	});

	return (
		<FormWrapper title={t('components.treasury.createWallet.baseStep.title')} onSubmit={handleSubmit(onSubmit)}>
			<Input
				label={t('components.treasury.createWallet.baseStep.name.label')}
				placeholder={t('components.treasury.createWallet.baseStep.name.placeholder')}
				error={errors.name?.message}
				{...register('name')}
			/>

			<Textarea
				label={t('components.treasury.createWallet.baseStep.description.label')}
				placeholder={t('components.treasury.createWallet.baseStep.description.placeholder')}
				error={errors.description?.message}
				{...register('description')}
			/>

			<Input
				leftIcon={isAddress(address) && <WalletAvatar seed={address} size="xs" />}
				rightIcon={isAddress(address) && <CheckIcon fill={colors.accentPositive} />}
				label={t('components.treasury.createWallet.baseStep.address.label')}
				placeholder={t('components.treasury.createWallet.baseStep.address.placeholder')}
				disabled={!isEmpty(params.address)}
				error={errors.address?.message}
				{...register('address')}
			/>

			<Button
				className="mt-3"
				color="accentPrimary"
				size="lg"
				type="submit"
				disabled={!isValid || isLoading}
				label={t('components.treasury.createWallet.baseStep.addWalletBtn')}
			/>
		</FormWrapper>
	);
};
