import { Caption, Ellipsis } from 'src/components/text';
import { Avatar } from 'src/components/common/avatar';
import { colors } from 'src/style';

type NftCardDaoDescriptionProps = {
	daoName: string;
	daoSeed: string;
	avatar: string | null;
	className?: string;
};

export const NftCardDaoDescription = (props: NftCardDaoDescriptionProps) => {
	const { daoName, daoSeed, avatar, className = '' } = props;

	return (
		<div className={`flex items-center justify-start gap-2 ${className}`}>
			<Avatar seed={daoSeed} fileId={avatar} size="18" />
			<Ellipsis color={colors.foregroundSecondary} as={Caption}>
				{daoName}
			</Ellipsis>
		</div>
	);
};
