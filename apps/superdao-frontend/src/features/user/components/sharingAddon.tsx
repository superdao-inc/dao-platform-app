import Head from 'next/head';

import { isDev } from 'src/constants';
import { config } from 'src/constants/environment';

type Props = {
	fullUrl: string;
	hostname: string;
	protocol: string;
	daoName: string;
	slug: string;
	tier: string;
	tierId: string;
	isCurrentUser?: boolean;
};

export const SharingAddon = (props: Props) => {
	const { fullUrl, hostname, protocol, slug, tier, tierId, daoName, isCurrentUser } = props;

	const backendUrl = isDev ? config.backend : protocol + hostname;

	const ogImage = `${backendUrl}/api/${
		isCurrentUser ? 'email-nft-claim-preview' : 'nft-preview'
	}?slug=${slug}&tier=${tierId}`;
	const ogTitle = `${daoName} · ${tier}`;

	return (
		<Head>
			<meta property="og:url" content={fullUrl} />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={ogTitle} />
			<meta property="og:image" content={ogImage} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={ogTitle} />
			<meta name="twitter:text:title" content={ogTitle} />
			<meta name="twitter:image" content={ogImage} />
		</Head>
	);
};
