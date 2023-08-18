import { useTranslation } from 'next-i18next';
import cn from 'classnames';

import { Button, CookieIcon, SubHeading, toast } from 'src/components';
import { useFadeTransition } from 'src/hooks/transitions/useFadeTransition';
import { useDecideAboutCookiesMutation, useHasCookieDecisionQuery } from 'src/gql/user.generated';

import { AuthAPI } from '../auth';

export const CookieConfirmationPopup = () => {
	const { t } = useTranslation();

	const isAuthorized = AuthAPI.useIsAuthorized();

	const {
		data: hasCookieDecisionData,
		isLoading: isHasCookieDecisionDataLoading,
		refetch: refetchHasCookieDecisionData
	} = useHasCookieDecisionQuery({}, { enabled: isAuthorized });
	const { hasCookieDecision } = hasCookieDecisionData ?? {};

	const { mutate: decideAboutCookies } = useDecideAboutCookiesMutation();

	const isMounted = !isHasCookieDecisionDataLoading && !hasCookieDecision && isAuthorized;

	const { shouldShowEl, styles: fadeStyles } = useFadeTransition(isMounted, 300);

	const bindCookieDecision = (decision: boolean) => async () => {
		decideAboutCookies(
			{ decision },
			{
				onSuccess: () => refetchHasCookieDecisionData(),
				onError: () => {
					toast.error(t('cookie.error'), { position: 'bottom-center' });
				}
			}
		);
	};

	if (!shouldShowEl) return null;

	return (
		<div
			className={cn(
				'bg-backgroundQuaternary fixed bottom-3 left-1/2 z-50 block flex w-min -translate-x-1/2 items-start gap-4 rounded-xl p-4 opacity-0 transition-all duration-300 md:bottom-9 md:flex-nowrap md:items-center',
				fadeStyles
			)}
		>
			<CookieIcon width={36} height={36} className="shrink-0" />
			<div className="flex flex-wrap items-center gap-6 gap-y-0.5 md:flex-nowrap">
				<SubHeading className="w-[240px] md:w-[256px]">{t('cookie.text')}</SubHeading>
				<div className="mr-0 flex w-full items-center justify-start gap-3 md:mr-2 md:w-max md:justify-start md:justify-center">
					<Button
						onClick={bindCookieDecision(false)}
						label={t('actions.labels.decline')}
						size="md"
						color="overlaySecondary"
					/>
					<Button
						onClick={bindCookieDecision(true)}
						label={t('actions.labels.accept')}
						size="md"
						color="accentPrimary"
					/>
				</div>
			</div>
		</div>
	);
};
