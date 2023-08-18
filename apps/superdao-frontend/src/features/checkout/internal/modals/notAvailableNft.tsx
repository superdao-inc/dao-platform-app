import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const NotAvailableNftModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.limits.heading')}
			body={t('pages.checkout.modal.validations.limits.description')}
			onRedirect={onRedirect}
		/>
	);
};
