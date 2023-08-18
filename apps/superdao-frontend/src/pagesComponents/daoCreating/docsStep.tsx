import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormWrapper } from './formWrapper';
import { StepProps } from './types';

import { Button, DaoDocsFields } from 'src/components';
import { DaoFields, daoSchema } from 'src/validators/daos';

const docsSchema = daoSchema.pick({
	documents: true
});

export const DocsStep = (props: StepProps) => {
	const { onSubmit, onBack } = props;

	const { t } = useTranslation();
	const { register, control, handleSubmit, formState } = useForm<DaoFields>({
		resolver: zodResolver(docsSchema),
		mode: 'onChange',
		defaultValues: {
			documents: [{}, {}]
		}
	});

	const { isValid, errors } = formState;

	return (
		<FormWrapper title={t('pages.createDao.docsTitle')} onSubmit={handleSubmit(onSubmit)} formCss={formStyles}>
			<DaoDocsFields register={register} control={control} errors={errors} />

			<ButtonsWrapper>
				<Button
					color="accentPrimary"
					size="lg"
					type="submit"
					disabled={!isValid}
					label={t('pages.createDao.createLabel')}
					data-testid="DaoForm__continueButton"
				/>
				<Button
					size="lg"
					label={t('pages.createDao.backLabel')}
					color="transparent"
					onClick={onBack}
					data-testid="DaoForm__backButton"
				/>
			</ButtonsWrapper>
		</FormWrapper>
	);
};

const ButtonsWrapper = styled.div`
	display: flex;
	gap: 12px;
`;

const formStyles = css`
	gap: 32px;
`;
