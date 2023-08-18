import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

export const IsNotNFTOwnerModal = ({ onRedirect }: { onRedirect: () => void }) => {
	const { t } = useTranslation();

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.validations.unknown.heading')}
			body={t('pages.checkout.modal.validations.unknown.description')}
			onRedirect={onRedirect}
		/>
	);
};
