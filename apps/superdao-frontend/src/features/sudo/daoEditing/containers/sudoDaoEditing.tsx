import Link from 'next/link';
import { useState } from 'react';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';
import { PageLoader } from 'src/components';
import { SudoDaoForm } from 'src/features/sudo/daoEditing/components/sudoDaoForm';
import { SudoDaoTabs } from 'src/features/sudo/daoEditing/components/sudoDaoTabs';
import { SudoDaoAnalytics } from 'src/features/sudo/daoEditing/components/sudoDaoAnalytics';

type Props = {
	slug: string;
};

export const SudoDaoEditing = (props: Props) => {
	const { slug } = props;

	const [currentTab, setCurrentTab] = useState('Edit Dao');

	const { data, isLoading, refetch } = useDaoBySlugQuery({ slug });
	const { daoBySlug } = data || {};

	if (isLoading) {
		return <PageLoader />;
	}

	if (!daoBySlug) {
		return <p className="text-3xl text-white">Dao not found</p>;
	}

	return (
		<div className="w-[600px]">
			<Link href={`/${daoBySlug.slug}`} passHref>
				<a target="_blank" className="text-accentPrimary hover:text-accentPrimaryHover mb-2 ml-auto text-lg">
					Open in APP
				</a>
			</Link>

			<SudoDaoTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

			{currentTab === 'Edit Dao' ? <SudoDaoForm dao={daoBySlug} refetch={refetch} /> : null}

			{currentTab === 'Analytics' ? <SudoDaoAnalytics dao={daoBySlug} /> : null}
		</div>
	);
};
