import Link, { LinkProps } from 'next/link';
import React, { useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useCurrentUserQuery, useVisitPageMutation } from 'src/gql/user.generated';
import { useNewFeaturesQuery } from 'src/gql/onboarding.generated';
import { useIsAuthorized } from 'src/features/auth/hooks/useIsAuthorized';

type Props = LinkProps & {
	pathname: string;
	children: (highlighted: boolean) => React.ReactElement;
};

export const CustomLink = ({ children, pathname, ...rest }: Props) => {
	const queryClient = useQueryClient();

	const isAuthorized = useIsAuthorized();
	const { mutate } = useVisitPageMutation();
	const { data: userData } = useCurrentUserQuery({}, { enabled: isAuthorized });
	const { data: onboardingData } = useNewFeaturesQuery({}, { enabled: isAuthorized });

	const highlighted = useMemo(() => {
		if (!userData?.currentUser) {
			return false;
		}

		const feature = onboardingData?.clientFeatures.find((f) => pathname === f.name);
		if (feature) {
			const visited = userData.currentUser.onboarding?.visitedPages.includes(pathname);
			const isNewFeature = new Date(feature.createdAt) > new Date(userData.currentUser.createdAt);
			return !visited && isNewFeature;
		}

		return false;
	}, [onboardingData?.clientFeatures, userData?.currentUser, pathname]);

	const onVisitPage = () => {
		if (highlighted) {
			mutate({ pagePath: pathname }, { onSuccess: () => queryClient.refetchQueries(useCurrentUserQuery.getKey()) });
		}
	};

	return (
		<div onClick={onVisitPage}>
			<Link {...rest}>{children(highlighted)}</Link>
		</div>
	);
};
