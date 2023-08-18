import { useTranslation } from 'next-i18next';

import { ValidationModalPrefab } from './validationModalPrefab';

type ContractErrorModalProps = {
	onRedirect: () => void;
	body: string;
	isOpen?: boolean;
};

export const ContractErrorModal = (props: ContractErrorModalProps) => {
	const { t } = useTranslation();
	const { body, onRedirect, isOpen } = props;

	return (
		<ValidationModalPrefab
			title={t('pages.checkout.modal.contractError.heading')}
			body={body}
			onRedirect={onRedirect}
			isOpen={isOpen}
		/>
	);
};
