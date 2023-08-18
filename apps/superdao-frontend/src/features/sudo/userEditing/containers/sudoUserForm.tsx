import { useForm } from 'react-hook-form';
import pick from 'lodash/pick';

import { Button, Switch } from 'src/components';
import { PublicUserFragment, useUpdateUserMutation } from 'src/gql/user.generated';

type Props = {
	userByIdOrSlug: PublicUserFragment;
};

export const SudoUserForm = (props: Props) => {
	const { userByIdOrSlug } = props;
	const { mutate: updateDao } = useUpdateUserMutation();
	const onSubmit = (data: any) => updateDao({ updateUserData: data });

	const {
		register,
		handleSubmit,
		formState: { isDirty, isValid }
	} = useForm({
		defaultValues: userByIdOrSlug ? pick(userByIdOrSlug, ['id', 'hasBetaAccess']) : undefined,
		mode: 'onChange'
	});

	if (!userByIdOrSlug) return null;

	return (
		<form className="flex w-full max-w-2xl flex-col gap-4">
			<h1 className="text-3xl font-bold text-white">Editing user with wallet: {userByIdOrSlug.walletAddress}</h1>

			<Switch {...register('hasBetaAccess')}>
				<span className="font-bold text-white">Beta access</span>
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
