import { DaoPageNavigation } from '../components/daoPageNavigation';
import { PageNavigationWrapper } from '../components/pageNavigationWrapper';
import { PageNavigationProps } from '../types';

export const DaoNavigationContainer = (props: PageNavigationProps) => {
	const { toggleIsNavigationShown } = props;

	return (
		<PageNavigationWrapper>
			<DaoPageNavigation toggleIsNavigationShown={toggleIsNavigationShown} />
		</PageNavigationWrapper>
	);
};
