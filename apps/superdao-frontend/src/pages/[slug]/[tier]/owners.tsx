import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import uniqBy from 'lodash/uniqBy';

import { colors } from 'src/style';
import { getDaoWithRoles } from 'src/client/commonRequests';
import { Header, Name } from 'src/pagesComponents/common/header';
import { prefetchData, SSR } from 'src/client/ssr';
import { PageContent, PageLoader, Title2 } from 'src/components';
import { useCollectionInfoByTierQuery } from 'src/gql/nft.generated';
import { Owners } from 'src/pagesComponents/nft/owners';
import CopyNftsIds from 'src/pagesComponents/nft/copyOwnersAddress';
import { CustomHead } from 'src/components/head';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { MobileHeader } from 'src/components/mobileHeader';

type Props = {
	daoAddress: string;
	daoSlug: string;
	tier: string;
};

const NftOwnersPage: NextPageWithLayout<Props> = (props) => {
	const { daoAddress, daoSlug, tier } = props;

	const {
		push,
		query: { from }
	} = useRouter();
	const { t } = useTranslation();

	const { data, isLoading } = useCollectionInfoByTierQuery({
		daoAddress,
		tier
	});

	const { data: daoData } = useDaoBySlugWithRolesQuery({ slug: daoSlug });
	const { daoBySlug: dao } = daoData || {};

	const tierData = data?.collectionInfoByTier;

	const handleBackToTierInfo = () => {
		if (from && typeof from === 'string') {
			push(from);
			return;
		}
		push(`/${daoSlug}/${tier}`);
	};

	if (isLoading || !tierData) {
		return (
			<PageContent>
				<CustomHead
					main={dao?.name ? dao?.name : 'NFT owners'}
					additional={dao?.name ? 'NFT owners' : 'Superdao'}
					description={dao?.description ?? ''}
					avatar={dao?.avatar ?? null}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	const ownersHashMap = uniqBy(tierData.owners, 'id');

	const titleTemplate = (
		<Name>
			{t('components.owners.title')}
			<Title2 className="ml-2" color={colors.foregroundTertiary} data-testid="Owners__counter">
				{ownersHashMap.length}
			</Title2>
		</Name>
	);

	const copyBtnTemplate = <CopyNftsIds owners={ownersHashMap} isInside={false} />;

	return (
		<PageContent onBack={handleBackToTierInfo}>
			<CustomHead
				main={dao?.name ? dao?.name : 'NFT owners'}
				additional={dao?.name ? 'NFT owners' : 'Superdao'}
				description={dao?.description ?? ''}
				avatar={dao?.avatar ?? null}
			/>
			<MobileHeader className="mb-2" title={titleTemplate} onBack={handleBackToTierInfo} right={copyBtnTemplate} />
			<Header className="mb-4 hidden py-0 pb-1 lg:flex" data-testid="Owners__header">
				{titleTemplate}
			</Header>
			<Owners collectionAddress={tierData.collectionAddress} owners={ownersHashMap} slug={daoSlug} tier={tier} />
		</PageContent>
	);
};

NftOwnersPage.getLayout = getDaoLayout;

export default NftOwnersPage;

export const getServerSideProps = SSR(async (ctx) => {
	const { tier } = ctx.query;
	const slug = ctx.params?.slug;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	return {
		props: {
			daoAddress: dao.contractAddress,
			daoSlug: dao.slug,
			tier,
			...getProps()
		}
	};
});
