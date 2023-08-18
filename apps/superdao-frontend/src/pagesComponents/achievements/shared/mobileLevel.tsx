import styled from '@emotion/styled';
import cn from 'classnames';
import { Caption } from 'src/components';
import { basicColors, darkenColors } from './constants';

export const MobileLevelComponent = ({ level, className }: { level: number; className?: string }) => {
	const paletteSize = '  h-[32px] w-[32px]';
	const afterClassName = "after:ml-[4px] after:h-[24px] after:w-[24px] after:rounded-full after:content-['']";

	return (
		<Palette
			color={basicColors[level]}
			darkenColor={darkenColors[level]}
			className={cn(
				afterClassName,
				paletteSize,
				'text-foregroundPrimary relative ml-auto mr-1 flex items-center rounded-full',
				className
			)}
		>
			<div className="absolute bottom-0 top-0 left-0 right-0 flex items-center">
				<Caption className="mx-auto text-[13px]  font-bold">{level}</Caption>
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
