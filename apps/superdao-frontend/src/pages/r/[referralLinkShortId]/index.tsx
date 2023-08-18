import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { prefetchData, SSR } from 'src/client/ssr';
import { NextPageWithLayout } from 'src/layouts';
import { isNotEmptyString } from '@sd/superdao-shared';
import { useSingleReferralLinkQuery } from 'src/gql/referral.generated';
import { useDaoByIdQuery } from 'src/gql/daos.generated';
import {
	NftReferralClaimContainer,
	NftReferralClaimProps
} from 'src/features/claim/nft/containers/nftReferralClaimContainer';
import { SharingAddon } from 'src/features/referral/sharing/sharingAddon';
import { getProtocol } from 'src/utils/protocol';
import { useNftCollectionQuery } from 'src/gql/nft.generated';

type ReferralClaimPageProps = NftReferralClaimProps & {
	protocol: string;
	hostname: string;
	daoName: string;
	isRecursiveCampaign: boolean;
	tierName: string;
};

const ReferralClaimPage: NextPageWithLayout<ReferralClaimPageProps> = (props) => {
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
				type="ambassador"
			/>
			<NftReferralClaimContainer {...props} />
		</>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const shortId = ctx.params?.referralLinkShortId;

	if (!isNotEmptyString(shortId)) return { notFound: true };

	const { referralLinkByShortId } = (await useSingleReferralLinkQuery.fetcher({ shortId })()) || {};

	if (!referralLinkByShortId) return { notFound: true };

	const [_, getProps, isAuthorized] = await prefetchData(ctx);

	const { daoById } = (await useDaoByIdQuery.fetcher({ id: referralLinkByShortId.referralCampaign.daoId })()) || {};

	if (!daoById || !daoById.contractAddress) return { notFound: true };

	const { collection } = (await useNftCollectionQuery.fetcher({ daoAddress: daoById.contractAddress })()) || {};
	if (!collection) return { notFound: true };

	const tier = collection.tiers.find(({ id }) => id === referralLinkByShortId.referralCampaign.tier);
	if (!tier) return { notFound: true };

	const protocol = getProtocol(ctx);

	return {
		props: {
			...getProps(),
			protocol,
			isAuthorized,
			shortId,
			tierName: tier.tierName,
			tierId: tier.id,
			slug: daoById.slug,
			daoName: daoById.name,
			linkLimitExceeded: referralLinkByShortId.limitLeft === 0,
			referralCampaignShortId: referralLinkByShortId.referralCampaign.shortId,
			isRecursiveCampaign: referralLinkByShortId.referralCampaign.isRecursive
		}
	};
});

export default ReferralClaimPage;
