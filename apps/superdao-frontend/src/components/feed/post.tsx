import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import Markdown from 'markdown-to-jsx';
import { DateTime } from 'luxon';
import { useTranslation } from 'next-i18next';

import { AuthorPreview } from './postComponents/authorPreview';
import { Attachment } from './postComponents/attachment';
import { colors } from 'src/style';
import { useToggle } from 'src/hooks';

import { Body, Label1, SubHeading } from 'src/components/text';
import { formatText, isTextLimitAvailable } from 'src/utils/texts';
import { dateToIntervalPreview } from 'src/utils/dates';
import { markdownConfig } from 'src/utils/markdown';
import { useInterval } from 'src/hooks/use-interval';
import { PostMenu } from 'src/components/feed/postComponents/postMenu';
import { collapsedTextStyle, toggleStyles } from 'src/components/feed/postTextStyles';
import { CommonPostDaoFragment, CommonPostFragment } from 'src/gql/post.generated';
import { UserAPI } from 'src/features/user/API';
import { MAX_NUM_OF_LINES } from './constants';
import { isAdmin } from 'src/utils/roles';

type Props = {
	post: CommonPostFragment;
	dao: CommonPostDaoFragment;
};

const Post = (props: Props) => {
	const { post, dao } = props;

	const { t } = useTranslation();

	const [isShowMoreEnabled, toggleShowMore] = useToggle();

	const [datePreview, setDatePreview] = useState('');
	const isShowMoreAvailable = isTextLimitAvailable(post.text, MAX_NUM_OF_LINES);

	const updateDatePreview = () => {
		const createdAtDate = DateTime.fromISO(post.createdAt);
		setDatePreview(dateToIntervalPreview(createdAtDate));
	};

	useEffect(updateDatePreview, [post.createdAt]);
	useInterval(() => updateDatePreview(), 5000);

	const { data: roleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId: post.daoId });
	const { currentUserMemberRole } = roleData || {};
	const isPostEditable = isAdmin(currentUserMemberRole);

	const hasTextContent = post.text.length !== 0;
	const isCollapsed = isShowMoreAvailable ? !isShowMoreEnabled : false;
	const collapsedStyles = isCollapsed ? collapsedTextStyle : null;

	return (
		<div className="bg-backgroundSecondary rounded p-4 lg:p-5" data-testid={`DaoFeed__post${post.id}`}>
			<div className="flex items-center justify-between">
				<AuthorPreview dao={dao} />

				<SubHeading className="text-foregroundTertiary ml-auto mr-4" data-testid="DaoFeed__postDate">
					{datePreview}
				</SubHeading>

				{isPostEditable && <PostMenu post={post} />}
			</div>

			{hasTextContent && (
				<div className="mt-3.5 break-words">
					<Body css={[textContentStyles, collapsedStyles]} data-testid="DaoFeed__postText">
						<Markdown options={markdownConfig}>{formatText(post.text)}</Markdown>
					</Body>

					{isShowMoreAvailable && (
						<Label1 css={toggleStyles} onClick={toggleShowMore}>
							{isShowMoreEnabled ? t('components.post.showLessLabel') : t('components.post.showMoreLabel')}
						</Label1>
					)}
				</div>
			)}

			{post.attachments.length > 0 && (
				<div className="mt-4">
					{post.attachments.map((item) => (
						<Attachment key={item.id} attachment={item} />
					))}
				</div>
			)}
		</div>
	);
};

export { Post };

export const textContentStyles = css`
	& p {
		margin: unset;
	}

	& p:not(:last-child) {
		margin-block-end: 10px;
	}

	& a {
		color: ${colors.accentPrimary};
	}
`;
