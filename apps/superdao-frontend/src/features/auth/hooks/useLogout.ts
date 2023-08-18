import { useRouter } from 'next/router';

import { useLogoutMutation } from 'src/features/auth/hooks/useLogoutMutation';
import { magicLink } from 'src/libs/magicLink';

export const useLogout = () => {
	const { push } = useRouter();

	return useLogoutMutation({
		onSuccess: async () => {
			const isLoggedInMagic = await magicLink?.user.isLoggedIn();
			if (isLoggedInMagic) await magicLink?.user.logout();

			await push('/auth/login');
		},
		onError: async (error) => {}
	});
};
