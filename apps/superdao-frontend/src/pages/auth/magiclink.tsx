import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { ExtensionError } from 'magic-sdk';
import { magicLink } from 'src/libs/magicLink';
import { useSocialAuth } from 'src/features/auth/hooks';

import { NextPageWithLayout } from 'src/layouts';
import { prefetchData, SSR } from 'src/client/ssr';
import { LoginLayout } from 'src/layouts/loginLayout';
import { AuthUI } from 'src/features/auth';

const MagicCallbackPage: NextPageWithLayout = () => {
	const { push, query } = useRouter();
	const { mutate } = useSocialAuth();

	const provider = typeof query.provider === 'string' ? query.provider : 'social';
	const to = typeof query.to === 'string' ? query.to : undefined;

	const handleSuccess = () => {
		if (to) {
			push(to.toString());
			return;
		}

		push('/profile');
	};

	useEffect(() => {
		const redirectCallback = async () => {
			if (!magicLink) return;

			try {
				const result = await magicLink.oauth.getRedirectResult();

				mutate(result, { onSuccess: handleSuccess });
			} catch (e) {
				if (e instanceof ExtensionError && e.code === 'invalid_request') {
					console.log('error', e.code);
					// do nothing;
				}
			}
		};

		redirectCallback().then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<LoginLayout>
				<AuthUI.AuthenticationOptions />
			</LoginLayout>

			<AuthUI.ModalSocialWaiting provider={provider} />
		</>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export default MagicCallbackPage;
