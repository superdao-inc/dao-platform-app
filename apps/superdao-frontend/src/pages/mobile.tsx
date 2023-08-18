import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import copy from 'clipboard-copy';

import { prefetchData, SSR } from 'src/client/ssr';
import { Body, Button, ExternalLinkIcon, ShareIcon, Title2, toast } from 'src/components';
import { CustomHead } from 'src/components/head';
import { minDesktopWidth } from 'src/constants/browser';
import { getProtocol } from 'src/utils/protocol';
import { getDefaultLayout } from 'src/layouts';
import { MobileHeader } from 'src/components/mobileHeader';

type Props = {
	protocol: string;
	hostname: string;
};

const MobileStub = (props: Props) => {
	const { protocol, hostname } = props;
	const { t } = useTranslation();
	const { query, push } = useRouter();
	const from = typeof query.from === 'string' ? query.from : '';

	useEffect(() => {
		if (window.innerWidth >= minDesktopWidth && from) {
			push(from);
		}
	});

	const handleShare = () => {
		const url = typeof query.from === 'string' ? `${hostname}${query.from}` : `${hostname}/daos/`;
		const absoluteUrl = `${protocol}${url}`;

		try {
			navigator.share({ url: absoluteUrl });
		} catch {
			copy(absoluteUrl).then(() => toast(t('actions.confirmations.linkCopy'), { id: 'link-copy' }));
		}
	};

	const handleBackToMain = () => {
		push('/daos');
	};

	return (
		<div className="mx-auto flex h-full flex-col items-center justify-between px-4 pt-2 pb-10 text-center">
			<CustomHead main={'Mobile'} additional={'Superdao'} description={'Superdao mobile version'} />
			<div className="self-stretch">
				<MobileHeader withBurger />
			</div>

			<img height={56} src="/logo-full.svg" alt="" className="absolute top-2 z-10 mb-auto" />

			<div className="flex flex-col items-center">
				<ExternalLinkIcon className="mb-4" height={56} width={56} />
				<Title2 className="text-foregroundPrimary mb-2">{t('pages.mobile.title')}</Title2>
				<Body className="text-foregroundSecondary mb-8">{t('pages.mobile.description')}</Body>

				<Button
					size="lg"
					color="accentPrimary"
					label={t('actions.labels.share')}
					leftIcon={<ShareIcon width={16} height={16} className="fill-foregroundPrimary" />}
					onClick={handleShare}
				/>
				<Button
					className="mt-4"
					size="lg"
					color="overlayTertiary"
					label={t('actions.labels.backToHome')}
					onClick={handleBackToMain}
				/>
			</div>

			<Body className="text-foregroundTertiary">
				{t('pages.mobile.supportText')}
				<a className="text-accentPrimary" href="https://t.me/superdao_team" target="_blank" rel="noopener noreferrer">
					{t('pages.mobile.supportLink')}
				</a>
			</Body>
		</div>
	);
};

MobileStub.getLayout = getDefaultLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	const protocol = getProtocol(ctx);

	return { props: { ...getProps(), protocol } };
});

export default MobileStub;
