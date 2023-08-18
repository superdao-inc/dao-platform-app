import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const PaymentIsNotValidModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.payment.heading')}
			body={t('pages.checkout.modal.validations.payment.description')}
			onRedirect={onRedirect}
		/>
	);
};
