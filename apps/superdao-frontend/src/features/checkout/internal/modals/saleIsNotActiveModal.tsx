import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const SaleIsNotActiveModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.sale.heading')}
			body={t('pages.checkout.modal.validations.sale.description')}
			onRedirect={onRedirect}
		/>
	);
};
