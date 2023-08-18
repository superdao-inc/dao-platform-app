import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { Body, Button, Title1 } from 'src/components';
import { ModalContent, ModalFooter } from 'src/components/baseModal';

import { ValidationModal } from './validationModal';

type Props = {
	title: string | ReactNode;
	body: string | ReactNode;
	onRedirect?: () => void;
	isOpen?: boolean;
};

export const ValidationModalPrefab = (props: Props) => {
	const { title, body, onRedirect, isOpen = true } = props;

	const { t } = useTranslation();

	return (
		<ValidationModal isOpen={isOpen}>
			<ModalContent>
				<Title1>{title}</Title1>
				<Body className="text-foregroundSecondary mt-2">{body}</Body>
			</ModalContent>
			<ModalFooter
				right={
					<div className="flex gap-2">
						{onRedirect && (
							<Button onClick={onRedirect} label={t('pages.checkout.modal.back')} size="lg" color="accentPrimary" />
						)}
					</div>
				}
			/>
		</ValidationModal>
	);
};
