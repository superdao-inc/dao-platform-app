import { useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';
import cn from 'classnames';

import { CustomOption, CustomSingleValue } from './select/customSelectComponents';

import { useUploadWidget } from 'src/hooks';
import { Caption, Title1 } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { CreatePostRequest } from 'src/validators/posts';
import { CommonPostFragment } from 'src/gql/post.generated';
import { UserAPI } from 'src/features/user/API';
import { Avatar } from 'src/components/common/avatar';
import { AttachmentPreview } from 'src/components/upload/attachmentPreview';
import { Button } from 'src/components/button';
import { Textarea } from 'src/components/textarea';
import { CustomSelect } from 'src/components/customSelect';
import { isAdmin } from 'src/utils/roles';
import { ImageIcon } from 'src/components/assets/icons';

export type FormPublicPost = Omit<CreatePostRequest, 'daoId'> & { daoId?: string }; // Makes daoId optional

export type ManagePostModalProps = BaseModalProps & {
	title: string;
	submitLabel: string;
	hasDaoSelector: boolean;
	post?: CommonPostFragment;
	onSubmit: (post: FormPublicPost) => void;
};

const POST_TEXT_MAX_LENGTH = 2000;

export const ManagePostModal = (props: ManagePostModalProps) => {
	const { isOpen, onClose, post, title, hasDaoSelector, submitLabel, onSubmit } = props;
	const { t } = useTranslation();

	const { data: userData } = UserAPI.useCurrentUserQuery();
	const { currentUser } = userData || {};
	const { data: participationData } = UserAPI.useUserDaoParticipationQuery({ userId: currentUser?.id || '' });
	const { daoParticipation: userDaoParticipation } = participationData || {};

	const initialFiles: string[] = post?.attachments.map((item) => item.image!.fileId) || [];

	const [files, uploadWidget] = useUploadWidget({ imagesOnly: true, initialFiles });

	const {
		register,
		control,
		formState: { errors, isDirty, isSubmitting },
		handleSubmit: handelSubmitForm,
		reset,
		getValues
	} = useForm<FormPublicPost>({
		defaultValues: useMemo(() => (post ? { ...post } : {}), [post]),
		mode: 'onChange'
	});

	useEffect(() => {
		if (post) {
			const attachments = post.attachments.map((item) => item.image?.fileId) || [];
			reset({ ...post, attachments });
		}
	}, [post, reset]);

	const errorText = useMemo(() => {
		if (hasDaoSelector && errors.daoId) {
			return t('modals.posting.error.emptyDao');
		}

		if ((getValues('text')?.length ?? 0) > POST_TEXT_MAX_LENGTH) {
			return t('modals.posting.error.textOverflow', { maxLength: POST_TEXT_MAX_LENGTH });
		}

		if (!files.length && errors.text) {
			return t('modals.posting.error.emptyBody');
		}

		return undefined;
	}, [errors.daoId, errors.text, files.length, getValues, hasDaoSelector, t]);

	const handleSubmit = handelSubmitForm((data) => {
		onSubmit({ ...data, attachments: files.length ? [files[0]] : files });
		closeModal();
	});

	const closeModal = () => {
		reset();
		if (!post) uploadWidget.reset();
		onClose();
	};

	const userOwningDaos = useMemo(() => {
		return userDaoParticipation?.items.filter((dao) => isAdmin(dao.role));
	}, [userDaoParticipation]);

	const options = useMemo(() => {
		return userOwningDaos?.map(({ dao }) => ({
			value: dao.id,
			description: t('components.profileDaos.labels.members', { count: dao.membersCount }),
			label: dao.name,
			icon: <Avatar seed={dao.id} fileId={dao.avatar} size="md" />
		}));
	}, [userOwningDaos, t]);

	const canSend = (isDirty || Boolean(files.length)) && !isSubmitting;

	if (!userOwningDaos) return null;

	return (
		<Modal isOpen={isOpen} onClose={closeModal}>
			<form onSubmit={handleSubmit} data-testid="DaoFeed__postCreateForm">
				<ModalContent>
					<Title1 className="block" data-testid="DaoFeed__postCreateFormTitle">
						{title}
					</Title1>
					{hasDaoSelector && (
						<Controller
							name="daoId"
							control={control}
							rules={{ required: true }}
							render={({ field: { name, value, onChange, ref } }) => (
								<div className="mt-5">
									<CustomSelect
										innerRef={ref}
										onChange={({ value: newValue }) => onChange(newValue?.value)}
										name={name}
										placeholder="Select..."
										components={{ SingleValue: CustomSingleValue(!!errorText), Option: CustomOption }}
										value={options?.find((item) => item.value === value)}
										options={options}
									/>
									{errorText && <Caption className="accentNegativeActive mt-2 block">{errorText}</Caption>}
								</div>
							)}
						/>
					)}

					<div className={cn('mt-4 mb-0 w-full transition-all', { 'mb-5': !!errorText })}>
						<Textarea
							error={errorText}
							placeholder={t('modals.posting.textPlaceholder')}
							{...register('text', { required: files.length === 0, minLength: 1, maxLength: POST_TEXT_MAX_LENGTH })}
							data-testid="DaoFeed__postCreateFormTextArea"
						/>
					</div>
					{files.length > 0 && (
						<div className={cn('mt-4', { 'mt-9': !!errorText })}>
							{files.slice(0, 1).map((item) => (
								<AttachmentPreview key={item} file={item} onDelete={() => uploadWidget.delete(item)} />
							))}
						</div>
					)}
					{uploadWidget.render()}
				</ModalContent>
			</form>

			<ModalFooter
				left={
					<Button
						leftIcon={<ImageIcon className="fill-foregroundSecondary" />}
						size="md"
						color="backgroundQuaternary"
						label={t('upload.image.buttonLabel')}
						disabled={files.length > 0}
						onClick={() => uploadWidget.open()}
						data-testid="DaoFeed__postCreateImageButton"
					/>
				}
				right={
					<>
						<Button
							size="lg"
							color="backgroundTertiary"
							label={t('actions.labels.cancel')}
							onClick={closeModal}
							data-testid="DaoFeed__postCreateCancelButton"
						/>
						<Button
							size="lg"
							color="accentPrimary"
							label={submitLabel}
							disabled={!canSend}
							onClick={handleSubmit}
							data-testid="DaoFeed__postCreateSubmitButton"
						/>
					</>
				}
			/>
		</Modal>
	);
};
