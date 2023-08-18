import { useEffect, useRef } from 'react';

import { useLayoutContext } from 'src/providers/layoutProvider';
import { BurgerIcon } from 'src/components/assets/icons';
import { colors } from 'src/style';
import { Title1 } from 'src/components/text';

type Props = {
	rightNode?: React.ReactNode;
	titleText?: string;
};

export const ProfileHeader = (props: Props) => {
	const { rightNode, titleText } = props;
	const ref = useRef<HTMLDivElement>(null);
	const [_, { on: openNavigation }] = useLayoutContext();

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([e]) => e.target.classList.toggle('bg-backgroundSecondary', e.intersectionRatio < 1),
			{ threshold: [1] }
		);

		observer.observe(element);

		return () => observer.unobserve(element);
	}, []);

	return (
		<div
			ref={ref}
			className="z-1 sticky -top-0.5 left-0 right-0 -mx-4 flex items-center justify-between py-1 px-1 lg:hidden"
		>
			<button onClick={openNavigation} className="rounded-full p-3">
				<BurgerIcon fill={colors.foregroundTertiary} width={24} height={24} />
			</button>

			{titleText && <Title1 className="ml-1 mr-auto">{titleText}</Title1>}

			<div>{rightNode}</div>
		</div>
	);
};
