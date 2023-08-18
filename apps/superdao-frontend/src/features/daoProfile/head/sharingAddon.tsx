import truncate from 'lodash/truncate';
import Head from 'next/head';

import { isDev } from 'src/constants';
import { config } from 'src/constants/environment';

type Props = {
	fullUrl: string;
	hostname: string;
	protocol: string;
	daoName: string;
	daoDescription: string;
	slug: string;
};

export const SharingAddon = (props: Props) => {
	const { fullUrl, hostname, protocol, slug, daoName, daoDescription } = props;

	const backendUrl = isDev ? config.backend : protocol + hostname;

	return (
		<Head>
			<meta property="og:url" content={fullUrl} />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={daoName} />
			<meta property="og:description" content={truncate(daoDescription, { length: 140 })} />
			<meta property="og:image" content={`${backendUrl}/api/dao-profile-preview?slug=${slug}`} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={daoName} />
			<meta name="twitter:text:title" content={daoName} />
			<meta name="twitter:description" content={daoDescription} />
			<meta name="twitter:image" content={`${backendUrl}/api/dao-profile-preview?slug=${slug}`} />
		</Head>
	);
};
