import { checkSupervisorAuth, prefetchData, SSR } from 'src/client/ssr';
import { Button } from 'src/components';
import { useUpdateTreasuryValueMutation } from 'src/gql/treasury.generated';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';

const Whitelist = () => {
	const { mutate } = useUpdateTreasuryValueMutation();

	const onSubmit = () => {
		mutate(
			{},
			{
				onSuccess: (data) => {
					console.log(data);
				}
			}
		);
	};

	return (
		<SudoLayout>
			<Button
				type="button"
				label="Update treasuries value"
				className="mt-2"
				color="accentPrimary"
				size="md"
				onClick={onSubmit}
			/>
		</SudoLayout>
	);
};

export default Whitelist;

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});
