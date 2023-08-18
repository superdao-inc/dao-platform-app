import { prefetchData, SSR } from 'src/client/ssr';
import { getDaoLayout } from 'src/layouts';
import { emailClaimRedirect } from 'src/utils/redirects';
import { GetWhitelistRecordQuery, useGetWhitelistRecordQuery } from 'src/gql/whitelist.generated';

const NftEmailClaim = () => {
	return <></>;
};

NftEmailClaim.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const [queryClient] = await prefetchData(ctx);
	const slug = ctx.params?.slug;
	const uid = ctx.params?.uid;

	if (typeof slug !== 'string') return { notFound: true };
	if (typeof uid !== 'string') return { notFound: true };

	const wlRecord = await queryClient.fetchQuery<GetWhitelistRecordQuery | undefined>(
		useGetWhitelistRecordQuery.getKey({ id: uid }),
		useGetWhitelistRecordQuery.fetcher({ id: uid })
	);
	if (!wlRecord) return;
	const { tiers } = wlRecord?.getWhitelistRecord;

	console.log('wlRecord', wlRecord);

	//редирект на новую ссылку клейма, через next.config.js неполучится, по этому так
	return emailClaimRedirect(slug, tiers[0], uid);
});

export default NftEmailClaim;
