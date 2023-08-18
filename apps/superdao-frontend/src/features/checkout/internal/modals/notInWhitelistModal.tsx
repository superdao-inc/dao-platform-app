import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const NotInWhitelistModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.whitelist.heading')}
			body={t('pages.checkout.modal.validations.whitelist.description')}
			onRedirect={onRedirect}
		/>
	);
};
