import Link from 'next/link';
import { useRouter } from 'next/router';

import { css } from '@emotion/react';
import logoSvg from './logo.svg';

import { Body, DropdownMenu, ExternalLinkIcon } from 'src/components';
import { useLogout } from 'src/features/auth/hooks/useLogout';
import { colors } from 'src/style';

const routes = [
	{ href: '/sudo/daos', title: 'DAOs' },
	{ href: '/sudo/daos/whitelist', title: 'Whitelist' },
	{ href: '/sudo/users', title: 'Users' },
	{ href: '/sudo/onboarding', title: 'Onboarding' },
	{ href: '/sudo/scripts', title: 'Scripts' },
	{ href: '/sudo/treasury', title: 'Treasury' }
];

export default function SudoHeader() {
	const { pathname: currentPathname } = useRouter();

	const { mutate: logout } = useLogout();

	const options = [
		{
			label: 'Logout',
			before: <ExternalLinkIcon width={20} height={20} />,
			onClick: () => logout({})
		}
	];

	return (
		<div
			style={{
				boxShadow:
					'0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)'
			}}
			className="bg-backgroundSecondary fixed top-0 mx-auto w-full px-4 sm:px-6 lg:px-8"
		>
			<div className="flex h-16 items-center justify-between">
				<div className="flex items-center">
					<div className="flex space-x-8">
						<Link href="/daos">
							<a css={[anchorStyles]}>
								Go to App
								<img className="ml-2 h-5 w-5" src={logoSvg} alt="logo" />
							</a>
						</Link>

						<div className="flex space-x-4">
							{routes.map((route) => {
								const { href, title } = route;
								const anchorActivityClass = currentPathname === href ? anchorActiveStyles : null;

								return (
									<Link href={href} key={href} passHref>
										<Body css={[anchorStyles, anchorActivityClass]}>{title}</Body>
									</Link>
								);
							})}
						</div>
					</div>
				</div>

				<DropdownMenu shouldCloseOnSelect options={options} />
			</div>
		</div>
	);
}

const anchorStyles = css`
	display: flex;
	align-items: center;
	cursor: pointer;

	font-weight: 600;
	color: ${colors.foregroundSecondary};
	transition: all 0.3s;

	svg {
		transition: fill 0.3s;
		fill: ${colors.foregroundSecondary};
	}

	&:hover {
		color: ${colors.accentPrimaryHover};

		svg {
			fill: ${colors.accentPrimaryHover};
		}
	}
`;
const anchorActiveStyles = css`
	color: ${colors.accentPrimaryActive};

	svg {
		fill: ${colors.accentPrimaryActive};
	}
`;
