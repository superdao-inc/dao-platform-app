import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicDaoFragment } from 'src/gql/daos.generated';
import {
	useCreateDaoAnalyticsMutation,
	useDaoAnalyticsByDaoIdQuery,
	useUpdateDaoAnalyticsMutation
} from 'src/gql/daoAnalytics.generated';
import { Button, CustomSelect, PageLoader, toast } from 'src/components';
import * as Types from 'src/types/types.generated';

type Props = {
	dao: PublicDaoFragment;
};

const FormSchema = z.object({
	mask: z.string().min(1).max(100)
});

const options: Array<{ value: Types.DaoMaskType; label: Types.DaoMaskType }> = [
	{ value: Types.DaoMaskType.Internal, label: Types.DaoMaskType.Internal },
	{ value: Types.DaoMaskType.Public, label: Types.DaoMaskType.Public },
	{ value: Types.DaoMaskType.Test, label: Types.DaoMaskType.Test }
];

export const SudoDaoAnalytics = (props: Props) => {
	const { dao } = props;

	const { data, isLoading, refetch } = useDaoAnalyticsByDaoIdQuery({ daoId: dao.id });
	const { daoAnalyticsByDaoId } = data || {};

	const { mutate: updateDaoAnalytics } = useUpdateDaoAnalyticsMutation();
	const { mutate: createDaoAnalytics } = useCreateDaoAnalyticsMutation();

	const mutate = daoAnalyticsByDaoId ? updateDaoAnalytics : createDaoAnalytics;

	const {
		handleSubmit,
		control,
		formState: { isValid, isDirty },
		reset
	} = useForm({
		defaultValues: daoAnalyticsByDaoId ?? undefined,
		resolver: zodResolver(FormSchema),
		mode: 'onChange'
	});

	const onSubmit = (data: any) => {
		mutate(
			{ ...data, daoId: dao.id, id: daoAnalyticsByDaoId?.id },
			{
				onSuccess: () => {
					refetch();
					reset();
					toast.success('Dao analytics updated');
				}
			}
		);
	};

	if (isLoading) {
		return <PageLoader />;
	}

	return (
		<form className="flex w-full max-w-2xl flex-col gap-4">
			<h1 className="text-3xl font-bold text-white">Editing analytics</h1>

			<Controller
				control={control}
				rules={{ required: true }}
				render={({ field: { name, value, onChange, ref } }) => (
					<CustomSelect
						onChange={({ value: newValue }) => onChange(newValue?.value)}
						innerRef={ref}
						name={name}
						value={options.find(
							({ value: optionValue }) => optionValue === value || optionValue === daoAnalyticsByDaoId?.mask
						)}
						options={options}
					/>
				)}
				name={'mask'}
			/>

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
