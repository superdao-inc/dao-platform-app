module.exports = {
	important: 'body',
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	plugins: [
		require('@tailwindcss/line-clamp'),
		require('@tailwindcss/forms'),
		require('@tailwindcss/aspect-ratio'),
		function ({ addVariant, addUtilities }) {
			addVariant('children', '& > *');
			addVariant('children-hover', '& > *:hover');
			addVariant('hover-first', '&:hover > *:first-child');
			addVariant('first-child', '& *:first-child');
			addUtilities(
				{
					'.scrollbar-hide': {
						/* IE and Edge */
						'-ms-overflow-style': 'none',

						/* Firefox */
						'scrollbar-width': 'none',

						/* Safari and Chrome */
						'&::-webkit-scrollbar': {
							display: 'none'
						}
					},

					'.scrollbar-default': {
						/* IE and Edge */
						'-ms-overflow-style': 'auto',

						/* Firefox */
						'scrollbar-width': 'auto',

						/* Safari and Chrome */
						'&::-webkit-scrollbar': {
							display: 'block'
						}
					}
				},
				['responsive']
			);
		}
	],
	theme: {
		extend: {
			screens: {
				md: '800px',
				lg: '1200px'
			},
			colors: {
				transparent: 'transparent',

				foregroundPrimary: '#FFFFFF',
				foregroundSecondary: '#A2A8B4',
				foregroundTertiary: '#717A8C',
				foregroundTertiaryHover: '#717A8C',
				foregroundTertiaryActive: '#717A8C',
				foregroundQuaternary: '#465065',

				backgroundPrimary: '#1B202A',
				backgroundPrimaryHover: '#343A46',
				backgroundPrimaryActive: '#EBEDF0',

				backgroundSecondary: '#252B36',
				backgroundSecondaryHover: '#343A46',
				backgroundSecondaryActive: '#2B313E',

				backgroundProgress: '#252B36',

				backgroundTertiary: '#343A46',
				backgroundTertiaryHover: '#424958',
				backgroundTertiaryActive: '#2B313D',

				backgroundQuaternary: '#464C59',
				backgroundQuaternaryHover: '#464C59',
				backgroundQuaternaryActive: '#464C59',

				backgroundGrey: 'rgba(162, 168, 180, 0.15)',

				border: '#343B4B',

				accentPrimary: '#FC7900',
				accentPrimaryHover: '#FF932F',
				accentPrimaryActive: '#F07300',

				accentPositive: '#86F045',

				accentNegative: '#FF5471',
				accentNegativeHover: '#FF6D86',
				accentNegativeActive: '#EA3957',
				accentNegativeBackground: 'rgba(255, 84, 113, .2)',

				accentMuted: '#398FE5',

				overlayHeavy: 'rgba(27, 32, 42, 0.84)',
				overlaySecondary: 'rgba(208, 220, 245, 0.08)',
				overlayTertiary: 'rgba(208, 220, 245, 0.14)',
				overlayTertiaryHover: 'rgba(208, 220, 245, 0.08)',
				overlayTertiaryActive: 'rgba(27, 32, 42, 0.84)',
				overlayQuinary: 'rgba(208, 220, 245, 0.4)',
				overlayModal: 'rgba(27, 32, 42, 0.84)',
				overlayQuarternary: 'rgba(208, 220, 245, 0.2)',
				overlayTintCyan: 'rgba(54, 190, 217, 0.15)',

				activeIndicator: '#40B855',
				errorDefault: '#f23051',

				tintBlue: '#21A6FA',
				tintBlueHover: '#43B5FE',
				tintBlueActive: '#21A6FAE6',
				tintOrange: '#FF9F1A',
				tintCyan: '#36BED9',
				tintGreen: '#40B855',
				greenYellow: '#86F045',
				tintGrey: '#71747A',
				tintPurple: '#7A24F2',
				yellow: '#FFC803'
			},
			zIndex: {
				1: '1',
				2: '2',
				5: '5',
				10: '10',
				20: '20',
				50: '50'
			},
			boxShadow: {
				orangeCircle: '0 0 24px #FC7900'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 }
				}
			},
			opacity: {
				15: '.15'
			}
		},
		fontFamily: {
			montserrat: ['Montserrat', 'sans-serif'],
			sfpro: ['SF Pro Text', 'sans-serif'],
			looswide: ['Loos Wide', 'Montserrat', 'sans-serif']
		},
		aspectRatio: {
			auto: 'auto',
			square: '1 / 1',
			video: '16 / 9'
		}
	},
	variants: {
		fill: ['hover', 'focus']
	}
};
