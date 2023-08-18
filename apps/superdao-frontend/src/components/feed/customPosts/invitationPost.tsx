import styled from '@emotion/styled';
import copy from 'clipboard-copy';
import { useTranslation } from 'next-i18next';

import { textContentStyles } from '../post';
import { colors, getInputWrapperStyle } from 'src/style';
import { PublicDaoFragment } from 'src/gql/daos.generated';
import { Body, Ellipsis } from 'src/components/text';
import { Button } from 'src/components/button';
import { toast } from 'src/components/toast/toast';
import { AuthorPreview } from 'src/components/feed/postComponents/authorPreview';

type Props = {
	dao: PublicDaoFragment;
	publicLink: string;
};

export const InvitationPost = (props: Props) => {
	const { dao, publicLink } = props;

	const { t } = useTranslation();

	const handleCopyLink = () => {
		copy(publicLink).then();
		toast(t('actions.confirmations.linkCopy'), { id: 'invitation-copy' });
	};

	return (
		<div className="bg-backgroundSecondary rounded p-5">
			<div className="flex justify-between">
				<AuthorPreview dao={dao} />
			</div>

			<div className="mt-3.5 break-words">
				<Body css={textContentStyles}>{t('components.feed.invitationPost')}</Body>
			</div>

			<LinkWrapper>
				<Link>
					<Ellipsis>{publicLink}</Ellipsis>
				</Link>
				<Button size="lg" label={t('actions.labels.copy')} color="accentPrimary" onClick={handleCopyLink} />
			</LinkWrapper>
		</div>
	);
};

const LinkWrapper = styled.div`
	margin-top: 12px;

	display: flex;
	column-gap: 16px;
	justify-content: space-between;
`;

const Link = styled.div`
	color: ${colors.foregroundPrimary};
	${() => getInputWrapperStyle({ disabled: true })};

	overflow: hidden;
`;
