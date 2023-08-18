import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const EmailIsNotValidModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.email.heading')}
			body={t('pages.checkout.modal.validations.email.description')}
			onRedirect={onRedirect}
		/>
	);
};
