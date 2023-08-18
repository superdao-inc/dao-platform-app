import React from 'react';
import { useTranslation } from 'next-i18next';
import { OAuthProvider } from '@magic-ext/oauth';

import Link from 'next/link';
import {
	Button,
	Caption,
	Detail,
	DiscordIcon,
	FacebookIcon,
	GoogleIcon,
	IconButton,
	Input,
	Label2,
	MetamaskIcon,
	Title1,
	TwitterIcon,
	WalletConnect
} from 'src/components';
import { WalletType } from 'src/types/wallet';
import Tooltip from 'src/components/tooltip';
import { howToCreateWallet } from 'src/constants';

type Social = {
	icon: React.ReactElement;
	name: OAuthProvider;
	enabled: boolean;
};

const socials: Social[] = [
	{
		icon: <GoogleIcon />,
		name: 'google',
		enabled: true
	},
	{
		icon: <FacebookIcon fill="white" width={24} height={24} />,
		name: 'facebook',
		enabled: true
	},
	{
		icon: <DiscordIcon fill="white" width={24} height={24} />,
		name: 'discord',
		enabled: true
	},
	{
		icon: <TwitterIcon fill="white" width={24} height={24} />,
		name: 'twitter',
		enabled: true
	}
];

type AuthorisationOptionsProps = {
	onAuthMagicLink?: (email: string) => void;
	onAuthMagicSocial?: (social: OAuthProvider) => void;
	onAuthWithWallet?: (walletType: WalletType) => () => void;
	onEmailChange?: (email: string) => void;

	isLoading?: boolean;
	email?: string;
};

export const AuthenticationOptions = (props: AuthorisationOptionsProps) => {
	const { onAuthMagicSocial, onAuthMagicLink, onAuthWithWallet, onEmailChange, isLoading, email = '' } = props;

	const { t } = useTranslation();

	return (
		<div className="h-full w-full self-center">
			<Title1 className="pb-1.5 text-center">{t('pages.login.title')}</Title1>

			<div className="mt-4 flex w-full gap-3">
				<Button
					className="flex-1 px-0"
					color="backgroundTertiary"
					size="lg"
					onClick={onAuthWithWallet?.('metamask')}
					disabled={isLoading}
					label={
						<div className="flex items-center gap-2">
							<MetamaskIcon />

							<Label2>{t('pages.login.wallets.metamask')}</Label2>
						</div>
					}
					data-testid={'WalletItem__metamask'}
				/>

				<Button
					className="flex-1 px-0"
					color="backgroundTertiary"
					size="lg"
					onClick={onAuthWithWallet?.('walletconnect')}
					disabled={isLoading}
					label={
						<div className="flex items-center gap-2">
							<WalletConnect />

							<Label2>{t('pages.login.wallets.walletConnect')}</Label2>
						</div>
					}
					data-testid={'WalletItem__walletConnect'}
				/>
			</div>

			<Detail className="text-foregroundSecondary mt-5 text-center uppercase tracking-[.25px]">
				{t('pages.login.or')}
			</Detail>

			<div className="mt-4 flex flex-col gap-4">
				<Input
					className="px-1"
					placeholder={t('pages.login.emailInput.placeholder')}
					value={email}
					disabled={isLoading}
					onChange={(e) => onEmailChange?.(e.target.value)}
				/>
				<Button
					disabled={!email.trim() || isLoading}
					onClick={() => onAuthMagicLink?.(email)}
					className="w-full"
					color="accentPrimary"
					size="lg"
					label={t('pages.login.btn.continue')}
				/>
			</div>

			<div className="mt-6 flex w-full flex-nowrap items-center gap-3">
				{socials.map((social) => {
					const { icon, name, enabled } = social;

					if (enabled) {
						return (
							<IconButton
								key={name}
								disabled={isLoading}
								onClick={() => onAuthMagicSocial?.(name)}
								className="flex-1 px-0"
								color="backgroundTertiary"
								size="lg"
								icon={icon}
							/>
						);
					}

					return (
						<Tooltip className="flex-1" key={name} content={'Coming soon...'} placement="top">
							<div className="bg-backgroundQuaternary flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg opacity-40">
								{icon}
							</div>
						</Tooltip>
					);
				})}
			</div>

			<Caption className="text-foregroundQuaternary mt-6 text-center">
				{t('pages.login.caption.walletCreation')}
				<Link href={howToCreateWallet} data-testid={'AnchorWalletItem__hint'}>
					<a target="_blank" className="text-foregroundTertiary transition-all duration-300 hover:text-white">
						{' '}
						{t('pages.login.caption.hint')}
					</a>
				</Link>
			</Caption>
		</div>
	);
};
