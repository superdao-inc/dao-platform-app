import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

import { shouldRedirectToMobileStub } from 'src/utils/shouldRedirectToMobileStub';
import { isProduction } from 'src/constants';

// @ts-expect-error
class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);

		if (shouldRedirectToMobileStub(ctx.pathname) && ctx.res) {
			ctx.res.writeHead(302, {
				Location: `/mobile?from=${ctx.asPath}`
			});
			ctx.res.end();
			return {};
		}

		return {
			...initialProps
		};
	}

	render() {
		const { ids, css } = this.props as any;
		const emotionCss = ids?.join(' ');

		const googleTagManagerScript = isProduction ? (
			<noscript
				dangerouslySetInnerHTML={{
					__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K8GM349" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}>`
				}}
			/>
		) : null;

		return (
			<Html lang="en">
				<Head>
					<style data-emotion-css={emotionCss} dangerouslySetInnerHTML={{ __html: css }} />
				</Head>
				<body>
					<Main />
					<NextScript />
					{googleTagManagerScript}
				</body>
			</Html>
		);
	}
}

export default MyDocument;
