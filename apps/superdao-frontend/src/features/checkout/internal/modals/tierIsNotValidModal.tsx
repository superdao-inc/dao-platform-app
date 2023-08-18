import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const TierIsNotValidModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.tier.heading')}
			body={t('pages.checkout.modal.validations.tier.description')}
			onRedirect={onRedirect}
		/>
	);
};
