import { useTranslation } from 'next-i18next';
import unset from 'lodash/unset';

import { FormPublicPost, ManagePostModal } from 'src/components/modals/postModals/managePostModal';
import { BaseModalProps } from 'src/components/baseModal';
import { CommonPostFragment, useEditPostMutation } from 'src/gql/post.generated';
import { useEditPostSuccess } from 'src/hooks';

export type EditPostModalProps = BaseModalProps & {
	post: CommonPostFragment;
};

export const EditPostModal = (props: EditPostModalProps) => {
	const { post } = props;

	const { t } = useTranslation();

	const { mutate: editPost } = useEditPostMutation();
	const onEditSuccess = useEditPostSuccess();

	const handleEditSubmit = (newPost: FormPublicPost) => {
		unset(newPost, 'id');
		unset(newPost, 'dao');
		unset(newPost, 'daoId');
		unset(newPost, 'createdAt');
		unset(newPost, 'updatedAt');

		editPost(
			{ updatePostData: { ...newPost, postId: post.id } },
			{
				onSuccess: onEditSuccess,
				onError: (error) => {}
			}
		);
	};

	return (
		<ManagePostModal
			{...props}
			hasDaoSelector={false}
			onSubmit={handleEditSubmit}
			title={t('modals.editing.title')}
			submitLabel={t('modals.editing.submit')}
		/>
	);
};
