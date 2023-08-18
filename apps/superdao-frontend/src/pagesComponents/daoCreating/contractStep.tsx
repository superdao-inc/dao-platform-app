import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';

import { Button } from 'src/components';
import { BlockchainButton } from 'src/components/blockchain-button';
import { ContractInfo } from 'src/pagesComponents/daoCreating/contractInfo';
import { FormWrapper } from 'src/pagesComponents/daoCreating/formWrapper';
import { StepProps } from 'src/pagesComponents/daoCreating/types';

export const ContractStep = ({ onBack, onSubmit, isLoading }: StepProps) => {
	const { t } = useTranslation();

	const { handleSubmit } = useForm({
		mode: 'onChange'
	});

	return (
		<FormWrapper title={t('pages.createDao.contractTitle')} onSubmit={handleSubmit(onSubmit)}>
			<ContractInfo />
			<ButtonsWrapper>
				<BlockchainButton
					disabled={isLoading}
					isLoading={isLoading}
					color="accentPrimary"
					size="lg"
					type="submit"
					label={t('pages.createDao.createLabel')}
				/>
				<Button
					disabled={isLoading}
					size="lg"
					label={t('pages.createDao.backLabel')}
					color="transparent"
					onClick={onBack}
				/>
			</ButtonsWrapper>
		</FormWrapper>
	);
};

const ButtonsWrapper = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 12px;
`;
