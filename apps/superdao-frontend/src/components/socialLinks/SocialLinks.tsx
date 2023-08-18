import classNames from 'classnames';
import { memo } from 'react';
import { IconButton } from 'src/components/button';
import { DiscordIcon, InstagramIcon, LinkIcon, TelegramIcon, TwitterIcon } from 'src/components/assets/icons';

export type SocialsLinksProps = {
	twitter?: string | null;
	discord?: string | null;
	telegram?: string | null;
	instagram?: string | null;
	site?: string | null;
	className?: string;

	onSocialLinkClick?(link: string): void;
};

const COMMON_ICON_PROPS = {
	className: 'rounded-full',
	color: 'backgroundTertiary',
	size: 'md'
} as const;

const SocialLinks = (props: SocialsLinksProps) => {
	const { twitter, discord, telegram, instagram, site, onSocialLinkClick, className = '' } = props;

	const handleSocialClick = (link: string) => () => onSocialLinkClick?.(link);

	const hasAnySocialLink = twitter || instagram || discord || telegram || site;

	if (!hasAnySocialLink) return null;

	return (
		<div className={classNames('flex h-8 gap-2', className)}>
			{site && (
				<IconButton
					onClick={handleSocialClick(site)}
					{...COMMON_ICON_PROPS}
					icon={<LinkIcon />}
					data-testid="Profile__siteButton"
				/>
			)}
			{twitter && (
				<IconButton
					onClick={handleSocialClick(twitter)}
					{...COMMON_ICON_PROPS}
					icon={<TwitterIcon />}
					data-testid="Profile__twitterButton"
				/>
			)}
			{instagram && (
				<IconButton
					onClick={handleSocialClick(instagram)}
					{...COMMON_ICON_PROPS}
					icon={<InstagramIcon />}
					data-testid="Profile__instagramButton"
				/>
			)}
			{telegram && (
				<IconButton
					onClick={handleSocialClick(telegram)}
					{...COMMON_ICON_PROPS}
					icon={<TelegramIcon />}
					data-testid="Profile__telegramButton"
				/>
			)}
			{discord && (
				<IconButton
					onClick={handleSocialClick(discord)}
					{...COMMON_ICON_PROPS}
					icon={<DiscordIcon />}
					data-testid="Profile__discordButton"
				/>
			)}
		</div>
	);
};

export default memo(SocialLinks);
