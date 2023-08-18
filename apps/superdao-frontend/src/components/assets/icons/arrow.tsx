import { Svg, SvgProps } from '../svg';

export const Arrow = (props: SvgProps) => (
	<Svg width="14" height="14" viewBox="0 0 14 14" {...props}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.292 7c0 .575-.467 1.042-1.042 1.042H4.265l4.055 4.055a1.042 1.042 0 1 1-1.473 1.473L1.013 7.737a1.042 1.042 0 0 1 0-1.474L6.847.43A1.042 1.042 0 1 1 8.32 1.903L4.265 5.958h9.985c.575 0 1.042.467 1.042 1.042Z"
			fill="#fff"
		/>
	</Svg>
);
