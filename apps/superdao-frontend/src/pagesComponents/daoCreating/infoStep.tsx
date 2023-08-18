import styled from '@emotion/styled';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormWrapper } from './formWrapper';
import { StepProps } from './types';

import { daoSchema } from 'src/validators/daos';
import { LogoUploader, Button, Input, Textarea } from 'src/components';

const infoSchema = daoSchema.pick({
	name: true,
	description: true,
	avatar: true
});
type InfoFields = z.infer<typeof infoSchema>;

export const InfoStep = (props: StepProps) => {
	const { onSubmit, accumulator } = props;

	const { t } = useTranslation();
	const { register, handleSubmit, formState, setValue } = useForm<InfoFields>({
		resolver: zodResolver(infoSchema),
		mode: 'onChange'
	});

	const { isValid, errors } = formState;

	return (
		<FormWrapper title={t('pages.createDao.infoTitle')} onSubmit={handleSubmit(onSubmit)}>
			<Uploaders>
				<LogoUploader
					currentAvatar={accumulator.avatar}
					seed="NEW_DAO_IMAGE"
					label={t('upload.logoLabel')}
					onChange={(cover) => setValue('avatar', cover)}
				/>
			</Uploaders>

			<Input
				defaultValue={accumulator.name}
				label={t('components.dao.name.label')}
				placeholder={t('components.dao.name.placeholder')}
				error={errors.name?.message}
				{...register('name')}
			/>

			<Textarea
				defaultValue={accumulator.description}
				label={t('components.dao.description.label')}
				placeholder={t('components.dao.description.placeholder')}
				{...register('description')}
				error={errors.description?.message}
			/>

			<Button
				className="mt-3"
				color="accentPrimary"
				size="lg"
				type="submit"
				disabled={!isValid}
				label={t('actions.labels.continue')}
				data-testid="DaoForm__continueButton"
			/>
		</FormWrapper>
	);
};

const Uploaders = styled.div`
	width: 100%;
	display: flex;
`;
