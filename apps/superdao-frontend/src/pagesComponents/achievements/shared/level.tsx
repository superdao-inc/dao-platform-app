import styled from '@emotion/styled';
import cn from 'classnames';
import { Caption } from 'src/components';
import { basicColors, darkenColors } from './constants';

export const LevelComponent = ({
	level,
	className,
	bigSize
}: {
	level: number;
	className?: string;
	bigSize?: boolean;
}) => {
	const paletteSize = bigSize
		? ' h-[40px] w-[40px] after:h-[30px] after:w-[30px] after:ml-[3px] after:!ml-[5px]'
		: ' h-[22px] w-[22px] after:h-[16px] after:w-[16px] after:ml-[3px]';
	const captionSize = bigSize ? 'text-[17.5px] leading-5' : 'text-[12px]';

	const afterClassName = "after:ml-[3px] after:h-[16px] after:w-[16px] after:rounded-full after:content-['']";

	return (
		<Palette
			color={basicColors[level]}
			darkenColor={darkenColors[level]}
			className={cn(
				afterClassName,

				'text-foregroundPrimary relative ml-auto mr-0 flex items-center rounded-full lg:mr-1',
				paletteSize,
				className
			)}
		>
			<div className="absolute bottom-0 top-0 left-0 right-0 flex items-center">
				<Caption className={cn(captionSize, 'mx-auto  font-bold')}>{level}</Caption>
			</div>
		</Palette>
	);
};

const Palette = styled.div<{ color: string; darkenColor: string }>`
	background: ${(props) => `linear-gradient(135deg, ${props.color} 0%, ${props.darkenColor} 100%);`};
	:after {
		background-color: rgba(27, 32, 42, 0.5);
	}
`;
