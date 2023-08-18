import { HTMLAttributes } from 'react';
import { openExternal } from 'src/utils/urls';

type Props = {
	title?: string;
	url?: string;
	disabled?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const TwitterShareButton = (props: Props) => {
	const { title, url, disabled, children, ...rest } = props;

	const handleShare = () => {
		openExternal(`https://twitter.com/intent/tweet?url=${url}&text=${title}`);
	};

	return (
		<div onClick={disabled ? undefined : handleShare} {...rest}>
			{children}
		</div>
	);
};
