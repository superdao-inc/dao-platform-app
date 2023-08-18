import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Switch, toast } from 'src/components';
import { PublicDaoFragment, useUpdateDaoMutation } from 'src/gql/daos.generated';
import { mapDaoDataToUpdate } from 'src/hooks';
import { validationSchema } from 'src/features/sudo/daoEditing/namespace';

type Props = {
	dao: PublicDaoFragment;
	refetch: () => void;
};

export const SudoDaoForm = (props: Props) => {
	const { dao, refetch } = props;
	const { mutate: updateDao } = useUpdateDaoMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid, isDirty },
		reset
	} = useForm({
		defaultValues: dao ? mapDaoDataToUpdate(dao) : undefined,
		resolver: zodResolver(validationSchema),
		mode: 'onTouched'
	});

	const onSubmit = (data: any) => {
		updateDao(
			{ updateDaoData: mapDaoDataToUpdate({ ...dao, ...data }) },
			{
				onSuccess: () => {
					refetch();
					reset();
					toast.success('Dao updated');
				}
			}
		);
	};

	return (
		<form className="flex w-full max-w-2xl flex-col gap-4">
			<div className="flex items-center">
				<h1 className="text-3xl font-bold text-white">Editing dao with slug: {dao.slug}</h1>
			</div>

			<Input
				className="w-full"
				label="Contract address"
				{...register('contractAddress')}
				error={errors.contractAddress?.message}
			/>

			<Input
				className="w-full"
				label="Opensea URL to collection page"
				{...register('openseaUrl')}
				error={errors.openseaUrl?.message}
			/>

			<Input
				label="Telegram support chat URL"
				className="w-full"
				{...register('supportChatUrl')}
				error={errors.supportChatUrl?.message}
			/>

			<Switch {...register('isVotingEnabled')}>
				<span className="font-bold text-white">Voting enabled</span>
			</Switch>

			<Switch {...register('isClaimEnabled')}>
				<span className="font-bold text-white">Claim enabled</span>
			</Switch>

			<Switch {...register('claimDeployDao')}>
				<span className="font-bold text-white">Claim deploy DAO enabled</span>
			</Switch>

			<Switch {...register('isInternal')}>
				<span className="font-bold text-white">Is internal</span>
			</Switch>

			<Button
				label={'Save changes'}
				color="accentPrimary"
				size="lg"
				onClick={handleSubmit(onSubmit)}
				disabled={!isDirty || !isValid}
			/>
		</form>
	);
};
