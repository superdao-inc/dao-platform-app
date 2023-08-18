import { ProfilePageNavigation } from '../components/profilePageNavigation';
import { PageNavigationWrapper } from '../components/pageNavigationWrapper';
import { PageNavigationProps } from '../types';

export const ProfileNavigationContainer = (props: PageNavigationProps) => {
	const { toggleIsNavigationShown } = props;

	return (
		<PageNavigationWrapper>
			<ProfilePageNavigation toggleIsNavigationShown={toggleIsNavigationShown} />
		</PageNavigationWrapper>
	);
};
