import truncate from 'lodash/truncate';
import Head from 'next/head';

import { isDev } from 'src/constants';
import { config } from 'src/constants/environment';

type Props = {
	fullUrl: string;
	protocol: string;
	hostname: string;
	daoName: string;
	description: string;
	slug: string;
	tier: string;
	tierId: string;
	type: 'ambassador' | 'landing';
};

export const SharingAddon = (props: Props) => {
	const { fullUrl, protocol, hostname, daoName, description, slug, tier, tierId, type = 'landing' } = props;

	const backendUrl = isDev ? config.backend : protocol + hostname;

	const ogImage = `${backendUrl}/api/share-${type}-preview?slug=${slug}&tier=${tierId}`;
	const ogTitle = `${daoName} · ${tier}`;

	return (
		<Head>
			<meta property="og:url" content={fullUrl} />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={ogTitle} />
			<meta property="og:description" content={truncate(description, { length: 140 })} />
			<meta property="og:image" content={ogImage} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={ogTitle} />
			<meta name="twitter:text:title" content={ogTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={ogImage} />
		</Head>
	);
};
