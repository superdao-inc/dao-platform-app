import upperFirst from 'lodash/upperFirst';
import { Ellipsis, Title3 } from 'src/components/text';

type NftCardTitleProps = {
	content: string;
	className?: string;
};

export const NftCardTitle = (props: NftCardTitleProps) => {
	const { content, className = '' } = props;

	return (
		<Ellipsis className={className} as={Title3}>
			{upperFirst(content)}
		</Ellipsis>
	);
};
