import { ClaimType } from 'src/constants/claimType';
import { WhitelistStatusEnum } from 'src/types/types.generated';
import { openExternal } from 'src/utils/urls';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { alreadyUsedImage, claimProcessImage, EmailClaimInfoLayout, mascotSadImage } from './emailClaimInfoLayout';

type Props = {
	type: ClaimType;
	status: WhitelistStatusEnum;
	daoName: string;
	daoSlug: string;
	isClaiming: boolean;
};

export const ClaimStatus = (props: Props) => {
	const { type, status, daoName, daoSlug, isClaiming } = props;
	const { t } = useTranslation();
	const { push } = useRouter();

	const isEmailClaim = type === ClaimType.EMAIL;

	let component = useMemo(() => {
		if (isEmailClaim && status === WhitelistStatusEnum.Used) {
			return (
				<EmailClaimInfoLayout
					image={alreadyUsedImage}
					title={t('pages.claim.emailNftClaiming.alreadyTitle')}
					description={
						<>
							{t('pages.claim.emailNftClaiming.alreadyDescription')} <br />
							{t('pages.claim.emailNftClaiming.alreadySupport')}
						</>
					}
					secondaryBtn={[t('actions.labels.support'), () => openExternal(`https://t.me/superdao_team`)]}
					btn={[`${t('actions.labels.goto')} ${daoName}`, () => push(`/${daoSlug}`)]}
				/>
			);
		}

		if (isEmailClaim && (status === WhitelistStatusEnum.Disabled || status === WhitelistStatusEnum.Archived)) {
			return (
				<EmailClaimInfoLayout
					image={mascotSadImage}
					title={t('pages.claim.emailNftClaiming.deactivatedTitle')}
					description={t('pages.claim.emailNftClaiming.deactivatedDescription')}
					btn={[`${t('actions.labels.goto')} ${daoName}`, () => push(`/${daoSlug}`)]}
				/>
			);
		}

		if (isEmailClaim && isClaiming) {
			return (
				<EmailClaimInfoLayout
					image={claimProcessImage}
					title={t('pages.claim.emailNftClaiming.processTitle')}
					isLoading
					description={t('pages.claim.emailNftClaiming.processDescription')}
				/>
			);
		}
	}, [daoName, daoSlug, isClaiming, isEmailClaim, push, status, t]);

	return <>{component}</>;
};
