import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { PageContent } from 'src/components/pageContent';
import { CustomHead } from 'src/components/head';
import { Body, BriefcaseIcon, DocsIcon, SmileIcon, Title1 } from 'src/components';
import { openExternal } from 'src/utils/urls';
import { MobileHeader } from 'src/components/mobileHeader';
import { privacyPolicy, termsOfUse } from 'src/constants';

export const ProfileAbout = () => {
	const { t } = useTranslation();
	const { back } = useRouter();

	const links = useMemo(() => {
		return [
			{
				text: t('pages.profileAbout.links.whatIsSuperdao'),
				icon: <SmileIcon />,
				href: 'https://superdao.notion.site/About-Superdao-240d101034524747a05bfc1b90ee3185'
			},
			{
				text: t('pages.profileAbout.links.jobs'),
				icon: <BriefcaseIcon />,
				href: 'https://superdao.notion.site/Jobs-at-Superdao-d8b6b7599cc243a9b27f8b63e0c8e2bb'
			},
			{
				text: t('pages.profileAbout.links.terms'),
				icon: <DocsIcon />,
				href: termsOfUse
			},
			{
				text: t('pages.profileAbout.links.policy'),
				icon: <DocsIcon />,
				href: privacyPolicy
			}
		];
	}, [t]);

	const bindOpenExternal = (href: string) => () => openExternal(href);

	return (
		<PageContent columnSize="sm">
			<CustomHead main={'About'} description={'About Superdao'} />

			<Title1 className="mb-6 hidden lg:flex">{t('pages.profileAbout.title')}</Title1>

			<MobileHeader title={t('pages.profileAbout.title')} onBack={back} />

			<div className="bg-backgroundSecondary w-full rounded-lg p-2">
				{links.map((link) => (
					<div key={link.text} className="flex cursor-pointer gap-4 py-3 px-4" onClick={bindOpenExternal(link.href)}>
						{link.icon}
						<Body>{link.text}</Body>
					</div>
				))}
			</div>
		</PageContent>
	);
};
