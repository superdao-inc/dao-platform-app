import { NextPage } from 'next';
import styled from '@emotion/styled';

import { Button, toast } from 'src/components';
import { checkSupervisorAuth, prefetchData, SSR } from 'src/client/ssr';
import { useAddDemoProposalsMutation } from 'src/gql/proposal.generated';
import { useUpdateDaosWithShortSlugAccessMutation } from 'src/gql/daos.generated';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';

const Scripts: NextPage = () => {
	const { mutate, isLoading } = useAddDemoProposalsMutation();
	const { mutate: updateDaosWithShortSlug, isLoading: isUpdateDaosWithShortSlugLoading } =
		useUpdateDaosWithShortSlugAccessMutation();

	const handleUpdateDaosWithShortSlug = () => {
		updateDaosWithShortSlug(
			{},
			{
				onSuccess: () => {
					toast.success('Daos with short slug updated successfully');
				},
				onError: () => {
					toast.error('Daos with short slug cannot be updated, look into console');
				}
			}
		);
	};

	const handleAddDemoProposals = () => {
		mutate(
			{},
			{
				onSuccess: () => {
					toast.success('Demo proposals added successfully');
				},
				onError: () => {
					toast.error('Demo proposals cannot be added, look into console');
				}
			}
		);
	};

	return (
		<SudoLayout>
			<Container>
				<Button
					onClick={handleAddDemoProposals}
					isLoading={isLoading}
					color="accentPrimary"
					size="md"
					label="Add demo proposals"
				/>
				<Button
					onClick={handleUpdateDaosWithShortSlug}
					isLoading={isUpdateDaosWithShortSlugLoading}
					color="accentPrimary"
					size="md"
					label="Add 'shortSlugAccess' to daos with short slug"
				/>
			</Container>
		</SudoLayout>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 20px;
`;

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export default Scripts;
