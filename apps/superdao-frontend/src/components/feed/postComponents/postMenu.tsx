import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';

import { Body, Title1 } from 'src/components/text';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { useDeletePostSuccess, useToggle } from 'src/hooks';
import { EditPostModal } from 'src/components/modals/postModals/editPostModal';
import { CommonPostFragment, useDeletePostMutation } from 'src/gql/post.generated';
import { EditIcon, TrashIcon } from 'src/components/assets/icons';
import { Button } from 'src/components/button';

import { DropdownMenu } from 'src/components/dropDownMenu';

type Props = {
	post: CommonPostFragment;
};

const modalStyles = {
	content: { minHeight: 175, maxWidth: 400 }
};

export const PostMenu = (props: Props) => {
	const { post } = props;
	const { id: postId, daoId } = post;

	const { t } = useTranslation();

	const [isDeleteModalOpen, toggleDeleteModal] = useToggle();
	const [isEditModalOpen, toggleEditModal] = useToggle();

	if (!daoId) throw new Error('daoId must be specified for the deletion.');

	const { mutate: deletePost } = useDeletePostMutation();
	const onDeletePostSuccess = useDeletePostSuccess(daoId);

	const handlePostDelete = useCallback(() => {
		deletePost(
			{ deletePostData: { postId } },
			{
				onSuccess: onDeletePostSuccess,
				onError: (error) => {}
			}
		);
		toggleDeleteModal();
	}, [deletePost, onDeletePostSuccess, postId, toggleDeleteModal]);

	const dropdownOptions = [
		{
			label: t('actions.labels.edit'),
			before: <EditIcon />,
			onClick: () => {
				toggleEditModal();
			}
		},
		{
			label: t('actions.labels.delete'),
			before: <TrashIcon />,
			onClick: () => {
				toggleDeleteModal();
			}
		}
	];

	const Wrapper = ({ children }: { children: React.ReactNode }) => <div className="children:w-[190px]">{children}</div>;

	return (
		<>
			<div className="h-[28px]">
				<DropdownMenu customWrapper={Wrapper} options={dropdownOptions} data-testid="DaoFeed__postDropdown" />
			</div>

			<Modal style={modalStyles} isOpen={isDeleteModalOpen} onClose={toggleDeleteModal}>
				<ModalContent>
					<Title1 className="mt-1 mb-2" data-testid="DaoFeed__postDeleteModalTitle">
						{t('components.post.deleteModal.title')}
					</Title1>
					<Body data-testid="DaoFeed__postDeleteModalBody">{t('components.post.deleteModal.description')}</Body>
				</ModalContent>
				<ModalFooter
					right={
						<>
							<Button
								size="lg"
								color="backgroundTertiary"
								label={t('actions.labels.cancel')}
								onClick={toggleDeleteModal}
								data-testid="DaoFeed__postDeleteModalCancelButton"
							/>
							<Button
								size="lg"
								color="accentNegative"
								label={t('actions.labels.delete')}
								onClick={handlePostDelete}
								data-testid="DaoFeed__postDeleteModalDeleteButton"
							/>
						</>
					}
				/>
			</Modal>

			<EditPostModal post={post} isOpen={isEditModalOpen} onClose={toggleEditModal} />
		</>
	);
};
