import defaultTo from 'lodash/defaultTo';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';

import { useUpsertTransactionMetaMutation } from 'src/gql/treasury.generated';
import { Button, Title1, Textarea, Caption, toast } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { colors } from 'src/style';
import { EcosystemType } from 'src/types/types.generated';

type Props = {
	ecosystem: EcosystemType;
	chainId?: number | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (input: string) => void;
	initialValue: string | null | undefined;
	title: string;
	walletId: string;
	hash: string;
};

export const ChangeMetaModal = ({
	isOpen,
	onClose,
	onSave,
	initialValue,
	title,
	ecosystem,
	chainId,
	walletId,
	hash
}: Props) => {
	const { t } = useTranslation();
	const { mutate, isLoading } = useUpsertTransactionMetaMutation();
	const { register, handleSubmit } = useForm<{ text: string }>();

	const handleFormSubmit = handleSubmit(({ text }) => {
		mutate(
			{
				data: {
					ecosystem,
					chainId,
					hash,
					walletId,
					description: text
				}
			},
			{
				onSuccess: () => {
					onSave(text);
					onClose();
				},
				onError: () => {
					toast.error(t('toasts.buyNft.fail'), {
						position: 'bottom-center',
						duration: 5000
					});
					onClose();
				}
			}
		);
	});

	const modalStyle = {
		content: { minHeight: 300, minWidth: 400 }
	};

	return (
		<Modal style={modalStyle} isOpen={isOpen} onClose={onClose}>
			<ModalContent data-testid={'DescriptionModal__wrapper'}>
				<Title1 className="mb-4" color={colors.foregroundPrimary} data-testid={'DescriptionModal__title'}>
					{title}
				</Title1>
				<div className="mb-3">
					<Textarea
						placeholder={t('components.treasury.descriptionModal.placeholder')}
						defaultValue={defaultTo<string>(initialValue, '')}
						{...register('text')}
					/>
				</div>
				<div className="max-w-[350px]">
					<Caption color={colors.foregroundTertiary} data-testid={'DescriptionModal__hint'}>
						{t('components.treasury.descriptionModal.hint')}
					</Caption>
				</div>
			</ModalContent>
			<ModalFooter
				right={
					<>
						<Button
							size="lg"
							color="backgroundTertiary"
							label={t('actions.labels.cancel')}
							onClick={onClose}
							data-testid={'DescriptionModal__cancelButton'}
						/>
						<Button
							size="lg"
							color="accentPrimary"
							label={t('actions.labels.save')}
							onClick={handleFormSubmit}
							isLoading={isLoading}
							data-testid={'DescriptionModal__saveButton'}
						/>
					</>
				}
			/>
		</Modal>
	);
};
