import { useRouter } from 'next/router';

import { forwardRef } from 'react';
import { UserDaoParticipationQuery } from 'src/gql/user.generated';
import { useLayoutContext } from 'src/providers/layoutProvider';

import { NavigationDaoAvatar } from './navigationDaoAvatar';
import { usePreventScroll } from 'src/hooks/usePreventScroll';
import { DaoMode } from 'src/types/types.generated';

type Props = {
	shouldPreventScroll: boolean;
	daos: UserDaoParticipationQuery['daoParticipation']['items'] | undefined;
};

export const DaoAvatarsList = forwardRef<HTMLDivElement, Props>((props, ref) => {
	const { daos, shouldPreventScroll } = props;

	const [, { toggle: toggleIsNavigationShown }] = useLayoutContext();

	usePreventScroll(shouldPreventScroll, ref);

	const { push, query } = useRouter();
	const { slug } = query;

	const bindRedirectToDao = (slug: string, mode: DaoMode) => () => {
		toggleIsNavigationShown();
		if (mode === DaoMode.Default) push(`/${slug}`);
		if (mode === DaoMode.Achievements) push(`/${slug}/achievements`);
	};

	return (
		<div className="flex flex-wrap" ref={ref}>
			{daos?.map((dao) => (
				<NavigationDaoAvatar
					key={dao.daoId}
					dao={dao.dao}
					isActive={(slug as string) === dao.dao.slug}
					onClick={bindRedirectToDao(dao.dao.slug, dao.dao.mode)}
				/>
			))}
		</div>
	);
});

DaoAvatarsList.displayName = 'DaoAvatarsList';
