const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const { i18n } = require('./next-i18next.config');
const withImages = require('next-images');
const withNextCircularDeps = require('next-circular-dependency');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});
const withTM = require('next-transpile-modules')(['@sd/superdao-shared']);

/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: 'dist',
	exclude: /node_modules/, // next-circular-dependency
	poweredByHeader: false,
	reactStrictMode: true,
	i18n,
	eslint: {
		ignoreDuringBuilds: true
	},
	onDemandEntries: {
		// period (in ms) where the server will keep pages in the buffer
		maxInactiveAge: 120 * 1000,
		// number of pages that should be kept simultaneously without being disposed
		pagesBufferLength: 10
	},
	compiler: {
		emotion: true
	},
	swcMinify: false, // TODO: changed to true due to fix of this issues https://github.com/uploadcare/react-widget/issues/351
	async redirects() {
		return [
			{
				// redirects for old daos, except "/create" route
				source: '/daos/:slug((?=^(?!create$).*$)(?=(?!^$).*))',
				destination: '/:slug',
				permanent: false
			},
			{
				source: '/:slug/:tier/checkout',
				destination: '/:slug/:tier/checkout/nft-checkout',
				permanent: false
			}
		];
	},
	publicRuntimeConfig: {
		// Will be available on both server and client
		// Get it on the client via "import getConfig from 'next/config';"
		APP_ENV: process.env.APP_ENV,
		VIA_API_KEY: process.env.VIA_API_KEY,
		INFURA_POLYGON_MAINNET_API_KEY: process.env.INFURA_POLYGON_MAINNET_API_KEY,
		VERCEL_ANALYTICS_ID: process.env.VERCEL_ANALYTICS_ID,
		POLYGON_UPDATE_MANAGER_PROXY: process.env.POLYGON_UPDATE_MANAGER_PROXY,
		MAGIC_PUBLISHABLE_KEY: process.env.MAGIC_PUBLISHABLE_KEY,
		BACKEND_SERVICE_URL: process.env.BACKEND_SERVICE_URL
	}
};

module.exports = (phase) => {
	// Plugins
	const plugins = [withImages];
	if (phase === PHASE_DEVELOPMENT_SERVER) {
		plugins.push(withTM);
		plugins.push(withNextCircularDeps);
	}
	if (process.env.ANALYZE === 'true') plugins.push(withBundleAnalyzer);

	return plugins.reduce((config, plugin) => plugin(config), { ...nextConfig });
};
