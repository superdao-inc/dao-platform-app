import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { Avatar, UserAvatar } from 'src/components/common/avatar';
import { Body } from 'src/components/text';
import { borders, colors } from 'src/style';
import { PublicDaoFragment } from 'src/gql/daos.generated';
import { UserAPI } from 'src/features/user/API';

type Props = {
	className?: string;
	onClick: () => void;
	dao?: PublicDaoFragment;
};

export const PostCreatingSuggestion = (props: Props) => {
	const { onClick, dao, className } = props;

	const { t } = useTranslation();
	const { data: userData } = UserAPI.useCurrentUserQuery();
	const { currentUser } = userData || {};

	return (
		<Wrapper data-testid="DaoFeed__postCreateWrapper" className={className}>
			{dao ? (
				<Avatar size="md" seed={dao.id} fileId={dao.avatar} data-testid="DaoFeed__postCreateAvatar" />
			) : (
				<UserAvatar
					size="md"
					seed={currentUser?.id}
					fileId={currentUser?.avatar}
					data-testid="DaoFeed__postCreateAvatar"
				/>
			)}
			<InputWrapper onClick={onClick} data-testid="DaoFeed__postCreateInput">
				<Text>{t('pages.feed.postingSuggestion')}</Text>
			</InputWrapper>
		</Wrapper>
	);
};

const Wrapper = styled.div`
	padding: 24px;
	border-radius: ${borders.medium};
	background: ${colors.backgroundSecondary};

	display: flex;
	justify-content: space-between;
	align-items: center;
	column-gap: 20px;
`;

const InputWrapper = styled.div`
	cursor: pointer;
	background: ${colors.overlaySecondary};
	border-radius: ${borders.medium};
	padding: 8px 16px;
	width: 100%;

	&:hover {
		background: ${colors.backgroundTertiaryHover};
	}
`;

const Text = styled(Body)`
	color: ${colors.foregroundSecondary};
`;
