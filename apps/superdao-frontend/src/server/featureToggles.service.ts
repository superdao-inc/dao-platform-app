import { isDev } from 'src/constants';
import { FEATURES } from '@sd/superdao-shared';

import { SSRContext } from 'src/client/ssr';

export const featureToggles = {
	isEnabled: (_: string) => true
};

export const getIsFeatureEnabled = (feature: FEATURES, ctx?: SSRContext | null) => {
	if (isDev) return true;

	switch (feature) {
		case FEATURES.PAYMENT_WITH_VIA: {
			const isPaymentWithViaEnabled = featureToggles.isEnabled(FEATURES.PAYMENT_WITH_VIA);

			const isPaymentWithViaEnabledAsSupervision = ctx?.currentUser?.isSupervisor ?? false;

			return isPaymentWithViaEnabled || isPaymentWithViaEnabledAsSupervision;
		}

		case FEATURES.SHARING_PREVIEW: {
			const isSharingEnabled = featureToggles.isEnabled(FEATURES.SHARING_PREVIEW);

			const isSharingEnabledAsSupervision = ctx?.currentUser?.isSupervisor ?? false;

			return isSharingEnabled || isSharingEnabledAsSupervision;
		}

		default:
			return false;
	}
};
