import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { prefetchData, SSR } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { useUserAsMemberQuery } from 'src/gql/daoMembership.generated';
import { NextPageWithLayout } from 'src/layouts';
import { isNotEmptyString } from '@sd/superdao-shared';
import { ReferralAmbassadorLanding } from 'src/features/referral/referral-landing/referralLanding';
import { getProtocol } from 'src/utils/protocol';
import { SharingAddon } from 'src/features/referral/sharing/sharingAddon';
import { useReferralCampaignByShortIdQuery } from 'src/gql/referral.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';

type Props = {
	protocol: string;
	hostname: string;
	slug: string;
	daoName: string;
	referralCampaignShortId: string;
	daoAddress: string;
	daoAvatar: string;
	tierId: string;
	tierName: string;
};

const ReferralPage: NextPageWithLayout<Props> = (props) => {
	const { asPath } = useRouter();
	const { t } = useTranslation();

	const fullUrl = props.protocol + props.hostname + asPath;

	return (
		<>
			<SharingAddon
				fullUrl={fullUrl}
				protocol={props.protocol}
				hostname={props.hostname}
				daoName={props.daoName}
				description={t('sharing.twitter.referral', { daoName: props.daoName })}
				slug={props.slug}
				tier={props.tierName}
				tierId={props.tierId}
				type="landing"
			/>
			<ReferralAmbassadorLanding {...props} fullUrl={fullUrl} />
		</>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const referralCampaignShortId = ctx.params?.referralCampaignId;
	const userId = ctx.req.session?.userId;

	if (!isNotEmptyString(slug) || !isNotEmptyString(referralCampaignShortId)) return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	const daoAddress = dao?.contractAddress;
	if (!dao || !daoAddress) return { notFound: true };

	if (isAuthorized) {
		await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });
	} else {
		queryClient.setQueryData(useUserAsMemberQuery.getKey({ daoId: dao.id, userId }), null);
	}

	const { referralCampaignByShortId } =
		(await useReferralCampaignByShortIdQuery.fetcher({ referralCampaignShortId })()) || {};
	queryClient.setQueryData(useReferralCampaignByShortIdQuery.getKey({ referralCampaignShortId }), {
		referralCampaignByShortId
	});
	if (!referralCampaignByShortId) return { notFound: true };

	const { collection } = (await useNftCollectionQuery.fetcher({ daoAddress })()) || {};
	if (!collection) return { notFound: true };

	const tier = collection.tiers.find(({ id }) => id === referralCampaignByShortId.tier);
	if (!tier) return { notFound: true };

	const props = getProps();
	const protocol = getProtocol(ctx);

	return {
		props: {
			...props,
			protocol,
			slug: dao.slug,
			daoName: dao.name,
			referralCampaignShortId,
			daoAddress: dao.contractAddress,
			tierId: referralCampaignByShortId.tier,
			tierName: tier.tierName
		}
	};
});

export default ReferralPage;
