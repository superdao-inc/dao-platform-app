import Link from 'next/link';

import { Ellipsis, Label2 } from 'src/components/text';
import { CommonPostDaoFragment } from 'src/gql/post.generated';
import { Avatar } from 'src/components/common/avatar';

type Props = {
	dao: CommonPostDaoFragment;
};

const AuthorPreview = (props: Props) => {
	const { dao } = props;
	const { id, slug, name, avatar } = dao;

	return (
		<div className="min-w-0">
			<Link href={`/${slug}`} passHref>
				<div className="flex cursor-pointer items-center" data-testid="DaoFeed__postAuthor">
					<Avatar className="mr-2.5" seed={id} fileId={avatar} size="xs" />
					<Ellipsis as={Label2}>{name}</Ellipsis>
				</div>
			</Link>
		</div>
	);
};

export { AuthorPreview };
