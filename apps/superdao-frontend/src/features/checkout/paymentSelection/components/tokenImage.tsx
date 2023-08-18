import { CheckMarkCircle } from 'src/components';

const CLASSNAME = 'h-10 w-10 max-w-max rounded-full';

type TokenImageProps = {
	isSelected: boolean;
	src: string;
	alt: string;
};

export const TokenImage = (props: TokenImageProps) => {
	const { isSelected, src, alt } = props;

	if (isSelected) return <CheckMarkCircle className={CLASSNAME} />;

	return <img className={CLASSNAME} src={src} alt={alt} />;
};
