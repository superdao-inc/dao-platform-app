import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import Markdown from 'markdown-to-jsx';

import { Body, Label1 } from 'src/components/text';
import { colors } from 'src/style';
import { tierDescriptionMarkdownConfig } from 'src/utils/markdown';

type DescriptionProps = {
	text: string;
};

const ONE_LINE_HEIGHT = 26;
const NUMBER_OF_LINES = 4;

export const NftDescription = ({ text }: DescriptionProps) => {
	const textBoxRef = useRef<HTMLSpanElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isEnough, setIsEnough] = useState(true);

	useLayoutEffect(() => {
		const isEnoughSpace = (textBoxRef.current?.offsetHeight || 0) <= ONE_LINE_HEIGHT * NUMBER_OF_LINES;
		setIsEnough(isEnoughSpace);
	}, []);

	const parsedText = useMemo(() => {
		return <Markdown options={tierDescriptionMarkdownConfig}>{text}</Markdown>;
	}, [text]);

	if (!isEnough) {
		return (
			<>
				<div className={cn('mt-5', !isOpen && 'max-h-24 overflow-hidden')}>
					<Body ref={textBoxRef} className={cn(!isOpen && 'line-clamp-4')}>
						{parsedText}
					</Body>
				</div>

				<button className="mt-1" onClick={() => setIsOpen((prev) => !prev)}>
					<Label1 color={colors.accentPrimary}>{isOpen ? 'Show less' : 'Show more'}</Label1>
				</button>
			</>
		);
	}

	return (
		<div>
			<Body ref={textBoxRef}>{parsedText}</Body>
		</div>
	);
};
