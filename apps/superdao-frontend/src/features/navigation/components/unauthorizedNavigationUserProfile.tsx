import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import { Button } from 'src/components/button';
import { Label1, SubHeading } from 'src/components/text';
import { AuthUI } from 'src/features/auth';

export const UnauthorizedNavigationUserProfile = () => {
	const { t } = useTranslation();
	const { openAuthModal } = AuthUI.useAuthModal();

	const handleLoginClick = useCallback(() => openAuthModal(), [openAuthModal]);

	return (
		<div className="mx-3 mt-auto w-full" data-testid={'DaoMenu__unauthorizedBlock'}>
			<div className="bg-overlaySecondary my-5 w-full rounded-md px-4 py-5">
				<img width="36px" height="22px" src="/logo.svg" alt="Superdao logo" />

				<Label1 className="mt-4" data-testid={'DaoMenu__unauthorizedTitle'}>
					{t('components.dao.navigation.unauthorized.joinSuperdao')}
				</Label1>
				<SubHeading className="text-foregroundSecondary mb-4" data-testid={'DaoMenu__unauthorizedSubtitle'}>
					{t('components.dao.navigation.unauthorized.createDaoInOneClick')}
				</SubHeading>

				<Button
					size="md"
					color="accentPrimary"
					label={t('actions.labels.login')}
					onClick={handleLoginClick}
					data-testid={'DaoMenu__unauthorizedConnectButton'}
				/>
			</div>
		</div>
	);
};
