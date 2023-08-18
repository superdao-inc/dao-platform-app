import { Caption, Ellipsis } from 'src/components/text';
import { colors } from 'src/style';

type NftCardBottomDescriptionProps = {
	content: string;
	className?: string;
};

const NftCardBottomDescription = (props: NftCardBottomDescriptionProps) => {
	const { content, className } = props;

	return (
		<Ellipsis className={className} color={colors.tintOrange} as={Caption}>
			{content}
		</Ellipsis>
	);
};

export default NftCardBottomDescription;
