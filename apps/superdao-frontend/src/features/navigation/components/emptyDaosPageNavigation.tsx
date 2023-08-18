import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { Button, Caption, DaosFilledIcon, Title3 } from 'src/components';
import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user';
import { colors } from 'src/style';
import { usePreventScrollWhenHeightChanges } from '../hooks/usePreventScrollWhenHeightChanges';

export const EmptyDaosNavigation = () => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};
	const hasBetaAccess = userData?.hasBetaAccess;

	const { data: daos } = UserAPI.useUserDaoParticipationQuery(
		{ userId: userData!.id },
		{ enabled: isAuthorized && !!userData }
	);
	const { daoParticipation } = daos || {};

	const handleCreateDao = () => {
		push('/daos/create');
	};

	const divRef = useRef<HTMLDivElement>(null);
	usePreventScrollWhenHeightChanges(divRef);

	return (
		<div className="h-full w-full" ref={divRef}>
			{!daoParticipation?.items.length && (
				<div className="flex h-full w-full flex-col items-center justify-center rounded-full text-center">
					<DaosFilledIcon className="mb-2" width={36} height={36} />

					<Title3 className="mb-1">
						{hasBetaAccess
							? t('components.navigation.secondary.nodaos.hasBetaAccess.title')
							: t('components.navigation.secondary.nodaos.noBetaAccess.title')}
					</Title3>

					<Caption className="mb-6" color={colors.foregroundSecondary}>
						{hasBetaAccess
							? t('components.navigation.secondary.nodaos.hasBetaAccess.description')
							: t('components.navigation.secondary.nodaos.noBetaAccess.description')}
					</Caption>

					<Button
						onClick={handleCreateDao}
						color="backgroundTertiary"
						label={
							hasBetaAccess
								? t('components.navigation.secondary.nodaos.hasBetaAccess.requestLabel')
								: t('components.navigation.secondary.nodaos.noBetaAccess.requestLabel')
						}
						size="md"
					/>
				</div>
			)}
		</div>
	);
};
