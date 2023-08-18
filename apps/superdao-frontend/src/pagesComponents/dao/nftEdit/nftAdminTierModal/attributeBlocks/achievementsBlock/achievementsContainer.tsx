import { useRouter } from 'next/router';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';
import { DaoMode } from 'src/types/types.generated';
import { AchievementsBlock } from './achievementsBlock';

type Props = {
	tierIdx: number;
};

export const AchievementsContainer = ({ tierIdx }: Props) => {
	const { query } = useRouter();
	const slug = typeof query.slug === 'string' ? query.slug : '';

	const { data } = useDaoBySlugQuery({ slug });
	const mode = data?.daoBySlug?.mode;

	if (mode === DaoMode.Achievements) {
		return <AchievementsBlock tierIdx={tierIdx} />;
	}

	return null;
};
