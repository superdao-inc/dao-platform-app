import { useTranslation } from 'next-i18next';

import { FormPublicPost, ManagePostModal } from 'src/components/modals/postModals/managePostModal';
import { BaseModalProps } from 'src/components/baseModal';
import { useCreatePostMutation } from 'src/gql/post.generated';
import { useCreatePostSuccess } from 'src/hooks';

export type CreatePostModalProps = BaseModalProps & {
	hasDaoSelector: boolean;
	daoId?: string;
};

export const CreatePostModal = (props: CreatePostModalProps) => {
	const { daoId } = props;

	const { t } = useTranslation();

	const { mutate: createPost } = useCreatePostMutation();
	const successCreation = useCreatePostSuccess();

	const handleCreateSubmit = (post: FormPublicPost) => {
		const daoIdForRequest = post.daoId ?? daoId!;

		createPost(
			{ createPostData: { ...post, daoId: daoIdForRequest } },
			{
				onSuccess: successCreation,
				onError: (error) => {}
			}
		);
	};

	return (
		<ManagePostModal
			{...props}
			onSubmit={handleCreateSubmit}
			title={t('modals.posting.title')}
			submitLabel={t('modals.posting.submit')}
		/>
	);
};
