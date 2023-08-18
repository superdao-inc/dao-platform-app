import { NextPage } from 'next';
import { useState } from 'react';

import { useQueryClient } from 'react-query';
import cn from 'classnames';
import { useAddNewFeatureMutation, useNewFeaturesQuery, useUpdateFeatureMutation } from 'src/gql/onboarding.generated';
import { Button, Input } from 'src/components';
import { NewFeatureInput } from 'src/features/onboarding/components/featureInput';
import { checkSupervisorAuth, prefetchData, SSR } from 'src/client/ssr';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';

const Onboarding: NextPage = () => {
	const [addingNew, setAddingNew] = useState(false);
	const [newFeature, setNewFeature] = useState('');

	const queryClient = useQueryClient();
	const { data } = useNewFeaturesQuery();
	const { mutate: addNewFeature } = useAddNewFeatureMutation();
	const { mutate: updateNewFeatures } = useUpdateFeatureMutation();

	const handleAddNewFeature = async () => {
		addNewFeature({ name: newFeature }, { onSuccess: () => queryClient.refetchQueries(useNewFeaturesQuery.getKey()) });
		setNewFeature('');
		setAddingNew(false);
	};

	const handleUpdateNewFeature = (id: string, name: string) => {
		updateNewFeatures({ id, name }, { onSuccess: () => queryClient.refetchQueries(useNewFeaturesQuery.getKey()) });
	};
	const sudoClass = 'flex h-full flex-col items-center justify-center';

	return (
		<SudoLayout>
			<div className={cn(sudoClass, 'gap-5')}>
				{data?.clientFeatures.map(({ id, name }) => (
					<NewFeatureInput key={id} id={id} name={name} onSave={handleUpdateNewFeature} />
				))}

				{addingNew ? null : (
					<Button onClick={() => setAddingNew(true)} color="accentPrimary" size="md" label="Add new" />
				)}

				{addingNew ? (
					<div className={cn(sudoClass, 'gap-2')}>
						<p>Add new feature for onboarding</p>
						<Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} />
						<Button color="accentPrimary" size="md" label="Save" onClick={handleAddNewFeature} />
					</div>
				) : null}
			</div>
		</SudoLayout>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export default Onboarding;
