import { NextPage } from 'next';
import Link from 'next/link';
import { EmailVerificationOptions } from '@sd/superdao-shared';

import { EmailVerificationUI, EmailVerificationAPI } from 'src/features/emailVerification';
import { PageContent } from 'src/components';
import { CustomHead } from 'src/components/head';
import { SSR } from 'src/client/ssr';
import { Logo } from 'src/components/common/Logo';

const Index: NextPage<EmailVerificationOptions> = ({ status, email }) => {
	return (
		<>
			<CustomHead main="Email verification" description="Superdao email verification" />
			<Link href="/" passHref>
				<a className="z-1 absolute m-4 flex h-[36px] w-[36px]">
					<Logo />
				</a>
			</Link>
			<PageContent className="h-full" columnClassName="flex items-center justify-center">
				<EmailVerificationUI.EmailVerification status={status} email={email} />
			</PageContent>
		</>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const { token } = ctx.query;

	if (typeof token !== 'string') throw Error('Search parameter "token" is invalid');

	const res = await EmailVerificationAPI.emailVerificationRequest({ token });

	return { props: res };
});

export default Index;
