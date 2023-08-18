import { useRouter } from 'next/router';
import { PageNavigationWrapper } from '../components/pageNavigationWrapper';
import { PageNavigationProps } from '../types';
import { UserPageNavigation } from '../components/userPageNavigation';
import { UserAPI } from 'src/features/user';

export const UserNavigationContainer = (props: PageNavigationProps) => {
	const { toggleIsNavigationShown } = props;

	const { query } = useRouter();
	const { idOrSlug } = query;

	const { data: user } = UserAPI.useUserByIdOrSlugQuery({ idOrSlug: idOrSlug as string });
	const { userByIdOrSlug } = user || {};

	return (
		<PageNavigationWrapper>
			<UserPageNavigation user={userByIdOrSlug} toggleIsNavigationShown={toggleIsNavigationShown} />
		</PageNavigationWrapper>
	);
};
