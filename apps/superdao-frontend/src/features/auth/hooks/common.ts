import { toast } from 'src/components/toast/toast';
import { loginMessageKey } from 'src/utils/toastKeys';

export const handleAuthError = (error: any, errorMessage: string | null, defaultError: string) => {
	const message = errorMessage ?? defaultError;
};
