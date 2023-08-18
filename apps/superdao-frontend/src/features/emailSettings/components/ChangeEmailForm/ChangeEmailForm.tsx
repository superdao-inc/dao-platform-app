import { useTranslation } from 'next-i18next';
import { MouseEvent, memo, useCallback, useState, useContext } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import cn from 'classnames';

import { Button, IconButton } from 'src/components/button';
import { updateEmailResolver } from 'src/validators/users';
import { SuccessIcon, Input, CrossIcon } from 'src/components';
import { PendingIcon } from 'src/components/assets/icons/pending';
import { SendEmailVerificationMessageMutation, UpdateUserEmailMutation } from 'src/gql/emailSettings.generated';
import { UserAPI } from 'src/features/user/API';
import { ResendEmailLink } from '../ResendEmailLink';
import { RemoveEmailButton } from '../RemoveEmailButton';
import { captureError } from '../../captureError';
import { useMountedState } from 'src/hooks/useMountedState';
import { EmailSettingsContext } from '../../context/EmailSettingsContext';
import { EmailSettingsAPI } from '../../API';

type FormData = { email: string };

const ChangeEmailForm = () => {
	const { t } = useTranslation();
	const emailSettingsData = useContext(EmailSettingsContext);

	const { data: userData, refetch: refetchCurrentUser } = UserAPI.useCurrentUserQuery();
	const { mutate: updateEmail } = EmailSettingsAPI.useUpdateUserEmailMutation();
	const { mutate: removeEmail } = EmailSettingsAPI.useRemoveUserEmailMutation();
	const { mutate: sendVerificationMessage, isLoading: resendLoading } =
		EmailSettingsAPI.useSendEmailVerificationMessageMutation();

	const { email: initialEmail, emailVerified } = userData?.currentUser ?? {};
	const currentEmail = initialEmail ?? '';

	const isMounted = useMountedState();
	const [multipleRequestsLoading, setMultipleRequestsLoading] = useState(false);
	const [nextAttemptToSendEmail, setNextAttemptToSendEmail] = useState(emailSettingsData.nextAttemptToSendEmail);
	const { control, formState, handleSubmit, register, setFocus, setValue } = useForm<FormData>({
		defaultValues: { email: currentEmail },
		resolver: updateEmailResolver,
		mode: 'onChange'
	});
	const email = useWatch({ control, name: 'email' });

	const handleFormSubmit = handleSubmit((data): void => {
		const { email } = data;
		setMultipleRequestsLoading(true);

		const onSuccess = async ({ updateUserEmail }: UpdateUserEmailMutation): Promise<void> => {
			if (!isMounted()) return;
			const { data } = await refetchCurrentUser();
			setValue('email', data?.currentUser?.email ?? '');
			setNextAttemptToSendEmail(updateUserEmail.nextAttemptToSendEmail);
			setMultipleRequestsLoading(false);
		};

		const onError = (error: unknown): void => {
			if (isMounted()) setMultipleRequestsLoading(false);
			captureError(error, t('errors.unknownServerError'));
		};

		const updateUserEmailInput = { email };
		updateEmail({ updateUserEmailInput }, { onSuccess, onError });
	});

	const handleRemoveEmailClick = useCallback(
		async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
			event.preventDefault();
			setMultipleRequestsLoading(true);

			const onSuccess = async (): Promise<void> => {
				if (!isMounted()) return;
				await refetchCurrentUser();
				setValue('email', '');
				setMultipleRequestsLoading(false);
			};

			const onError = (error: unknown): void => {
				if (isMounted()) setMultipleRequestsLoading(false);
				captureError(error, t('errors.unknownServerError'));
			};

			removeEmail({}, { onSuccess, onError });
		},
		[isMounted, refetchCurrentUser, removeEmail, setValue, t]
	);

	const resetEmail = useCallback(
		(event: MouseEvent<HTMLButtonElement>): void => {
			event.preventDefault();
			setValue('email', currentEmail, { shouldValidate: true });
			setFocus('email');
		},
		[currentEmail, setFocus, setValue]
	);

	const resendEmail = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			event.preventDefault();

			const onSuccess = async ({
				sendEmailVerificationMessage
			}: SendEmailVerificationMessageMutation): Promise<void> => {
				if (isMounted()) setNextAttemptToSendEmail(sendEmailVerificationMessage.nextAttemptToSendEmail);
			};

			const onError = (error: unknown): void => {
				captureError(error, t('errors.unknownServerError'));
			};

			sendVerificationMessage({}, { onSuccess, onError });
		},
		[isMounted, sendVerificationMessage, t]
	);

	const isLoading = multipleRequestsLoading || resendLoading;
	const emailChanged = email !== currentEmail;
	const showResendLink = !!email.length && !emailVerified && !emailChanged;
	const { isValid, errors } = formState;
	let statusTemplate = null;

	// Template

	if (emailChanged)
		statusTemplate = (
			<IconButton
				color="transparent"
				className="group"
				size="lg"
				icon={<CrossIcon className="fill-foregroundTertiary group-hover:fill-foregroundSecondary ease-in-out" />}
				isSymmetric
				disabled={isLoading}
				data-testid="ChangeEmailForm__resetEmail"
				onClick={resetEmail}
			/>
		);
	else if (emailVerified)
		statusTemplate = (
			<div className="text-tintGreen mx-3 flex items-center text-sm" data-testid="ChangeEmailForm__verified">
				<SuccessIcon className="fill-tintGreen mr-[6px]" />
				<span>{t('pages.emailSettings.emailStatus.verified')}</span>
			</div>
		);

	return (
		<form className="mt-6 pb-[88px] lg:pb-6" onSubmit={handleFormSubmit}>
			<div className="flex items-end gap-3">
				<Input
					label={t('pages.emailSettings.form.email.label')}
					placeholder={t('pages.emailSettings.form.email.placeholder')}
					error={errors.email?.message}
					errorClassName="whitespace-nowrap"
					renderRight={statusTemplate}
					disabled={!!currentEmail || isLoading}
					data-testid="ChangeEmailForm__emailInput"
					{...register('email')}
				/>
				{!!currentEmail && <RemoveEmailButton disabled={isLoading} onClick={handleRemoveEmailClick} />}
			</div>
			{showResendLink && (
				<div className={cn('flex gap-[6px] text-sm', errors.email ? 'mt-9' : 'mt-3')}>
					<div className="text-tintOrange flex items-center">
						<PendingIcon className="fill-tintOrange mr-[6px]" />
						<span>{t('pages.emailSettings.emailStatus.unverified')}</span>
					</div>
					<span>·</span>
					<ResendEmailLink deadline={nextAttemptToSendEmail} disabled={isLoading} onClick={resendEmail} />
				</div>
			)}
			<Button
				className="mt-[36px]"
				color="accentPrimary"
				size="lg"
				type="submit"
				label={t('pages.emailSettings.form.submitButton')}
				isLoading={isLoading}
				disabled={!isValid || isLoading || !emailChanged}
				data-testid="ChangeEmailForm__submitButton"
			/>
		</form>
	);
};

export default memo(ChangeEmailForm);
