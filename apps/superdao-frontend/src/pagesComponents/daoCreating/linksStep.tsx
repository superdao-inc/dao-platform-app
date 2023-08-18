import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import slugify from 'slugify';

import { FormWrapper } from './formWrapper';
import { StepProps } from './types';

import { useDebounce } from 'src/hooks';
import { Button, Input } from 'src/components';
import { DiscordIcon, LinkIcon, TelegramIcon, TwitterIcon, InstagramIcon } from 'src/components/assets/icons';
import { daoSchema } from 'src/validators/daos';
import { useCheckDaoSlugQuery } from 'src/gql/daos.generated';
import { ALL_BESIDES_URL_CHARS_REGEX } from '@sd/superdao-shared';

const linksSchema = daoSchema.pick({
	slug: true,
	site: true,
	twitter: true,
	instagram: true,
	discord: true,
	telegram: true
});
type LinksFields = z.infer<typeof linksSchema>;

export const LinksStep = (props: StepProps) => {
	const { onSubmit, accumulator, onBack, name, hostname } = props;

	const { t } = useTranslation();
	const proposedSlug = slugify((name || '').replace(ALL_BESIDES_URL_CHARS_REGEX, ''), { lower: true });
	const { register, watch, handleSubmit, formState, trigger, setError, setValue } = useForm<LinksFields>({
		resolver: zodResolver(linksSchema),
		defaultValues: { slug: proposedSlug },
		mode: 'onChange'
	});

	/**
	 * isValidated flag for disabling submit btn before validation is finised
	 */
	const [isValidated, setIsValidated] = useState(true);

	const watchedSlug = useDebounce(watch('slug'), 1000);

	const { isFetching, refetch } = useCheckDaoSlugQuery(
		{
			slug: watchedSlug
		},
		{
			onSuccess: ({ checkDaoSlug: { nextAvailable, isAvailable } }) => {
				if (proposedSlug === watchedSlug) {
					setValue('slug', nextAvailable.toLowerCase());
					setIsValidated(true);

					return;
				}

				if (!isAvailable) {
					setError('slug', { message: t('errors.validation.slug') });
				}

				setIsValidated(true);
			},
			retry: 0,
			enabled: !!watchedSlug
		}
	);

	useEffect(() => {
		refetch();
		trigger('slug');
	}, [trigger, refetch]);

	const onChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const slug = event.target.value.toLowerCase();

			setIsValidated(false);

			if (slug === watchedSlug) {
				setIsValidated(false);
				refetch();
			}

			setValue('slug', slug);
		},
		[setValue, refetch, watchedSlug]
	);

	const { isValid, errors } = formState;

	return (
		<FormWrapper title={t('pages.createDao.linksTitle')} onSubmit={handleSubmit(onSubmit)} formCss={formStyles}>
			<Input
				defaultValue={accumulator.slug}
				label={t('components.dao.publicLink.label')}
				prefix={`${hostname}/`}
				isLoading={isFetching}
				error={errors.slug?.message}
				{...register('slug', { onChange })}
			/>

			<Links>
				<Input
					label={t('components.dao.socialLinks.label')}
					defaultValue={accumulator.site ?? ''}
					leftIcon={<LinkIcon width={20} height={20} className="fill-foregroundSecondary" />}
					placeholder={t('components.dao.links.website')}
					className="w-full"
					{...register('site')}
				/>
				<Input
					defaultValue={accumulator.twitter ?? ''}
					leftIcon={<TwitterIcon width={20} height={20} className="fill-foregroundSecondary" />}
					placeholder="username"
					prefix="twitter.com/"
					prefixClassName="max-w-[130px]"
					className="w-full"
					{...register('twitter')}
				/>
				<Input
					defaultValue={accumulator.instagram ?? ''}
					leftIcon={<InstagramIcon width={20} height={20} className="fill-foregroundSecondary" />}
					placeholder="username"
					prefix="instagram.com/"
					prefixClassName="max-w-[130px]"
					className="w-full"
					{...register('instagram')}
				/>
				<Input
					defaultValue={accumulator.discord ?? ''}
					leftIcon={<DiscordIcon width={20} height={20} className="fill-foregroundSecondary" />}
					placeholder="invitation code"
					prefix="discord.com/invite/"
					prefixClassName="max-w-[130px]"
					className="w-full"
					{...register('discord')}
				/>
				<Input
					defaultValue={accumulator.telegram ?? ''}
					leftIcon={<TelegramIcon width={20} height={20} className="fill-foregroundSecondary" />}
					placeholder="username"
					prefix="t.me/"
					prefixClassName="max-w-[130px]"
					className="w-full"
					error={(errors.site || errors.twitter || errors.instagram || errors.discord || errors.telegram)?.message}
					{...register('telegram')}
				/>
			</Links>

			<ButtonsWrapper>
				<Button
					color="accentPrimary"
					size="lg"
					type="submit"
					disabled={!isValid || !isValidated || isFetching}
					label={t('actions.labels.continue')}
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

const Links = styled.fieldset`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;

	margin: 0;
	padding: 0;
	border: none;
`;

const ButtonsWrapper = styled.div`
	margin-top: 12px;
	display: flex;
	gap: 12px;
`;

const formStyles = css`
	& > header {
		margin-bottom: 12px;
	}
`;
