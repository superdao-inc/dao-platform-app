import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { ActionBlock, PageContent, Title1 } from 'src/components';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { isAdmin } from 'src/utils/roles';
import { MobileHeader } from 'src/components/mobileHeader';
import {
	AirdropEmailsIcon,
	AirdropWalletsIcon,
	ClaimLinkIcon,
	PrivateSaleIcon,
	PublicSaleIcon
} from 'src/components/assets/icons/nft';
import { UploadInterlayerModal } from 'src/pagesComponents/membersImport/uploadInterlayerModal';
import { EInterlayerAction, EInterlayerType, useInterlayerUploadModal } from 'src/hooks';
import { UploadModal } from 'src/pagesComponents/membersImport/uploadModal';
import { MANUAL_BY_EMAIL_SEARCH_PARAM } from 'src/constants';

type Props = {
	slug: string;
	daoId: string;
	hostname: string;
	contractAddress: string;
};

const DistributeNFTs: NextPageWithLayout<Props> = (props) => {
	const { slug } = props;

	const { push } = useRouter();
	const { t } = useTranslation();

	const handleBackToDao = () => {
		push(`/${slug}`);
	};

	const title = t('pages.distribute.title');

	const isShowClaimLinkNav = false;

	const {
		isUploadInterlayerModalOpen,
		withHandleInterlayerSelect,
		toggleInterlayerUploadModal,
		isUploadModalOpen,
		handleSubmitUploadModal,
		closeUploadModal,
		setRedirectUrl
	} = useInterlayerUploadModal({ slug });

	const [isEmailAirdropSelected, setIsEmailAirdropSelected] = useState<boolean>(false);

	const handleClickAirdropByWallet = useCallback(() => {
		setIsEmailAirdropSelected(false);
		toggleInterlayerUploadModal();
	}, [toggleInterlayerUploadModal]);

	const handleClickAirdropByEmail = useCallback(() => {
		setRedirectUrl(`/${slug}/members/manual?${MANUAL_BY_EMAIL_SEARCH_PARAM}=1`);
		setIsEmailAirdropSelected(true);
		toggleInterlayerUploadModal();
	}, [slug, toggleInterlayerUploadModal, setRedirectUrl]);

	return (
		<PageContent onBack={handleBackToDao} columnSize="sm">
			<Title1 className="mb-6 hidden lg:block">{title}</Title1>
			<MobileHeader title={title} onBack={handleBackToDao} />
			<ActionBlock
				className="mb-4 py-3 px-5 hover:cursor-pointer"
				title={t('pages.distribute.nav.airdropWallets.title')}
				subtitle={t('pages.distribute.nav.airdropWallets.description')}
				icon={<AirdropWalletsIcon />}
				onClick={handleClickAirdropByWallet}
			/>
			<ActionBlock
				className="mb-4 py-3 px-5 hover:cursor-pointer"
				title={t('pages.distribute.nav.airdropEmails.title')}
				subtitle={t('pages.distribute.nav.airdropEmails.description')}
				icon={<AirdropEmailsIcon />}
				onClick={handleClickAirdropByEmail}
			/>
			<Link href={`/${slug}/custom?tab=publicSale`} passHref>
				<a>
					<ActionBlock
						className="mb-4 py-3 px-5"
						title={t('pages.distribute.nav.publicSale.title')}
						subtitle={t('pages.distribute.nav.publicSale.description')}
						icon={<PublicSaleIcon />}
					/>
				</a>
			</Link>
			<Link href={`/${slug}/custom?tab=privateSale`} passHref>
				<a>
					<ActionBlock
						className="mb-4 py-3 px-5"
						title={t('pages.distribute.nav.privateSale.title')}
						subtitle={t('pages.distribute.nav.privateSale.description')}
						icon={<PrivateSaleIcon />}
					/>
				</a>
			</Link>
			{isShowClaimLinkNav && (
				<Link href={`/${slug}/members/manual`} passHref>
					<a>
						<ActionBlock
							className="mb-4 py-3 px-5"
							title={t('pages.distribute.nav.claimLink.title')}
							subtitle={t('pages.distribute.nav.claimLink.description')}
							icon={<ClaimLinkIcon />}
						/>
					</a>
				</Link>
			)}

			<UploadInterlayerModal
				isOpen={isUploadInterlayerModalOpen}
				onManualSelected={withHandleInterlayerSelect(EInterlayerAction.MANUAL, EInterlayerType.AIRDROP)}
				onImportSelected={withHandleInterlayerSelect(EInterlayerAction.IMPORT, EInterlayerType.AIRDROP)}
				onCancel={toggleInterlayerUploadModal}
				title={isEmailAirdropSelected ? t('pages.importMembers.modal.interlayer.emailAirdropHeading') : undefined}
				description={
					isEmailAirdropSelected ? t('pages.importMembers.modal.interlayer.emailAirdropDescription') : undefined
				}
				importCsvLabel={
					isEmailAirdropSelected ? t('pages.importMembers.modal.interlayer.emailAirdropImportCsv') : undefined
				}
				importCsvDescription={
					isEmailAirdropSelected
						? t('pages.importMembers.modal.interlayer.emailAirdropImportCsvDescription')
						: undefined
				}
				manualLabel={
					isEmailAirdropSelected ? t('pages.importMembers.modal.interlayer.emailAirdropAddManually') : undefined
				}
				manualDescription={
					isEmailAirdropSelected
						? t('pages.importMembers.modal.interlayer.emailAirdropAddManuallyDescription')
						: undefined
				}
			/>

			<UploadModal isOpen={isUploadModalOpen} onSubmit={handleSubmitUploadModal} onCancel={closeUploadModal} />
		</PageContent>
	);
};

DistributeNFTs.getLayout = getDaoLayout;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!isAdmin(userAsMember?.role)) return { notFound: true };

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			contractAddress: dao.contractAddress,
			...getProps()
		}
	};
});

export default DistributeNFTs;
