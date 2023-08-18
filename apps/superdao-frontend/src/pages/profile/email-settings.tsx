import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { EmailSettingsContextValue } from 'src/features/emailSettings/context/EmailSettingsContext';
import { EmailSettingsUI } from 'src/features/emailSettings';
import { UserUI } from 'src/features/user';
import { getProfileLayout, NextPageWithLayout } from 'src/layouts';

const ProfileEmailSettings: NextPageWithLayout<EmailSettingsContextValue> = ({ nextAttemptToSendEmail }) => {
	return (
		<EmailSettingsUI.EmailSettingsContext.Provider value={{ nextAttemptToSendEmail }}>
			<UserUI.ProfileEmailSettings />
		</EmailSettingsUI.EmailSettingsContext.Provider>
	);
};

ProfileEmailSettings.getLayout = getProfileLayout;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const { nextAttemptToSendEmail } = ctx.req.session ?? {};
	const [_, getProps] = await prefetchData(ctx);

	const props: ReturnType<typeof getProps> & EmailSettingsContextValue = getProps();

	if (nextAttemptToSendEmail) {
		props.nextAttemptToSendEmail = nextAttemptToSendEmail;
	}

	return { props };
});

export default ProfileEmailSettings;
