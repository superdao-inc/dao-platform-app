import { useTranslation } from 'next-i18next';
import copy from 'clipboard-copy';
import Link from 'next/link';
import { FC, useCallback } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { isString } from '@sd/superdao-shared';

import {
	FacebookIcon,
	FacebookShareButton,
	LinkIcon,
	PageContent,
	PageLoader,
	toast,
	TwitterIcon,
	TwitterShareButton
} from 'src/components';
import { AuthAPI, AuthUI } from 'src/features/auth';
import {
	useReferralCampaignByShortIdQuery,
	useReferralLinksQuery,
	useAmbassadorStatusQuery
} from 'src/gql/referral.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { EmailClaimInfoLayout, mascotSweatingImage } from 'src/features/claim/nft/components/emailClaimInfoLayout';
import { Hexagon, Star4, Star5, Triangle } from 'src/components/assets/arts';
import { TierCard } from './components/tierCard';
import { Footer } from './components/footer';
import { NftAmbassadorClaimContainer } from 'src/features/claim/nft/containers/nftAmbassadorClaimContainer';
import { AmbassadorStatus } from 'src/types/types.generated';

type Props = {
	fullUrl: string;
	slug: string;
	daoName: string;
	referralCampaignShortId: string;
	daoAddress: string;
};

export const ReferralAmbassadorLanding: FC<Props> = (props) => {
	const { fullUrl, slug, daoName, referralCampaignShortId, daoAddress } = props;
	const { t } = useTranslation();
	const { push, query } = useRouter();
	const isAuthorized = AuthAPI.useIsAuthorized();
	const { openAuthModal } = AuthUI.useAuthModal();

	const isSuccessClaimUrl = query.success === '1';
	const claimSecret = isString(query.s) ? query.s : null;

	const { data: { referralCampaignByShortId: campaign } = {}, isLoading: isCampaignLoading } =
		useReferralCampaignByShortIdQuery({
			referralCampaignShortId
		});

	const { data: { ambassadorStatus } = {}, isLoading: isAmbassadorStatusLoading } = useAmbassadorStatusQuery(
		{
			referralCampaignShortId,
			claimSecret
		},
		{
			enabled: isAuthorized
		}
	);

	const isAmbassador = ambassadorStatus?.message === AmbassadorStatus.HasAmbassadorNft || isSuccessClaimUrl;
	const isAmbassadorShouldClaim = !isAmbassador && ambassadorStatus?.message === AmbassadorStatus.ClaimAvailable;

	const { data: { referralLinks } = {}, isLoading: isLinksLoading } = useReferralLinksQuery(
		{
			referralCampaignShortId
		},
		{
			enabled: isAuthorized && isAmbassador
		}
	);

	const referralLinkData = referralLinks?.[0];
	const referralLinkHttp = referralLinkData && `${window.location.origin}/r/${referralLinkData.shortId}`;

	const walletNotEligible = !isAmbassador && isAuthorized;
	const dontHaveLinks = isAmbassador && !referralLinkData;

	const { data: { collection } = {}, isLoading: isCollectionLoading } = useNftCollectionQuery({ daoAddress });

	const tier = campaign?.tier && collection ? collection.tiers.find(({ id }) => id === campaign.tier) : null;
	const tierLink = campaign?.tier && `/${slug}/${campaign.tier}`;

	const handleCopyLink = () => {
		referralLinkHttp && copy(referralLinkHttp).then(() => toast.success(t('actions.confirmations.linkCopy')));
	};

	const onSuccessClaim = () => {
		push(`/${slug}/referral/${referralCampaignShortId}?success=1`);
	};
	const redirectToDao = () => push(`/${slug}`);

	const handleOpenAuthModal = useCallback(() => openAuthModal(), [openAuthModal]);

	const limitExceeded = referralLinkData?.limitLeft === 0 || (!!tier && tier.totalAmount === tier.maxAmount);
	const isLoading = isCollectionLoading || isLinksLoading || isCampaignLoading || isAmbassadorStatusLoading;

	// Template

	if (isLoading) {
		return (
			<PageContent className="min-h-screen">
				<PageLoader />
			</PageContent>
		);
	}

	if (isAmbassadorShouldClaim && tier && campaign) {
		return (
			<NftAmbassadorClaimContainer
				referralCampaignId={campaign.id}
				tier={tier.id}
				slug={slug}
				linkLimitExceeded={false}
				onSuccessClaim={onSuccessClaim}
			/>
		);
	}

	if (walletNotEligible) {
		return (
			<EmailClaimInfoLayout
				image={mascotSweatingImage}
				title={t('You can’t claim this NFT')}
				description={t('Claim is only available to whitelisted members')}
				secondaryBtn={[t('Go to DAO'), redirectToDao]}
				btn={[t('components.buyNft.btnTextNotEligible'), handleOpenAuthModal]}
			/>
		);
	}

	if (dontHaveLinks) {
		return (
			<EmailClaimInfoLayout
				image={mascotSweatingImage}
				title={t('Oops! Something went wrong')}
				description={`You own the new NFT from ${daoName}, but no referral links could be found. Please contact Superdao support`}
				secondaryBtn={[t('Go to DAO'), redirectToDao]}
				btn={[t('components.buyNft.btnTextNotEligible'), handleOpenAuthModal]}
			/>
		);
	}

	return (
		<div className="bg-backgroundPrimary  flex min-h-screen flex-col justify-between">
			<div className="bg-[url('/assets/referral-bg-sm.jpg')] bg-cover bg-bottom bg-no-repeat px-[20px] pt-5 md:bg-[url('/assets/referral-bg.jpg')] md:px-12 md:pt-[52px] lg:px-24">
				<div className="mx-auto flex max-w-[1170px]">
					<Link href="https://superdao.co/" passHref>
						<a>
							<img className="h-6 md:h-[33px]" src="/logo-full.svg" alt="Superdao" />
						</a>
					</Link>
				</div>
				<div className="relative mx-auto flex max-w-[1170px] flex-col pt-7 pb-14 md:flex-row md:pt-12 md:pb-24">
					<div className="hidden md:block">
						<Star4 fill="#755FFE" className="absolute right-4 md:left-[37%]" />
						<Star4 fill="#DCBCFA" width={14} height={14} className="absolute left-[75%] top-[75px] rotate-[-15deg]" />
						<Triangle
							fill="#9DED1A"
							width={16}
							height={16}
							className="absolute left-[63%] top-[330px] rotate-[55deg]"
						/>
						<Triangle
							fill="#FF21FBD9"
							width={38}
							height={38}
							className="absolute left-[65%] bottom-[160px] rotate-[-11deg]"
						/>
						<Hexagon fill="#FFED36E5" width={13} height={13} className="absolute left-[75%] top-[140px] z-10" />
						<div className="absolute left-[66%] top-[22%] h-[7px] w-[7px] rounded-full bg-[#C9FCBE]" />
						<div className="absolute left-[66%] top-[40%] h-[17px] w-[87px] rotate-[65deg] bg-[#BA3E0359]" />
						<div className="absolute left-[70%] top-[50%] z-10 h-[20px] w-[20px] rotate-[20deg] bg-[#F54721A6]" />
						<div className="absolute right-[-60px] top-[50%] z-10 h-[20px] w-[20px] rotate-[25deg] bg-[#FFED3673]" />
						<Star5 fill="#C9FCBED9" width={16} height={16} className="absolute right-[5%] bottom-[75px] " />
					</div>
					<div className="font-montserrat z-10 min-w-0 md:z-0 md:mr-16 lg:mr-32">
						<h1 className="font-looswide mb-4 text-[26px] font-bold leading-[33px] text-white md:mb-7 md:mt-20 md:text-4xl lg:text-[59px] lg:leading-[82px]">
							{isSuccessClaimUrl ? (
								<>
									Successfully <br className="hidden md:inline" /> claimed
								</>
							) : (
								`Claim a new ${tier?.tierName} NFT from ${daoName} and\xa0share it with your friends`
							)}
						</h1>

						<div className="text-base font-medium text-white md:text-2xl md:leading-[40px]">
							{isAuthorized ? (
								<>
									Now you can share the invite link <br className="hidden md:inline" /> so your friends can claim it too
								</>
							) : (
								'Connect your wallet to get an NFT and your personal invite link. Send the link to friends so they can claim membership NFTs'
							)}
						</div>

						{/* Mobile version, desktop below */}
						{tier && tierLink && (
							<TierCard
								tier={tier}
								collectionName={collection?.name}
								limitLeft={referralLinkData?.limitLeft}
								daoName={daoName}
								tierLink={tierLink}
								limitExceeded={limitExceeded}
								className="md:hidden"
							/>
						)}

						{isAuthorized ? (
							<div className="mt-6 flex flex-row flex-wrap items-center justify-center md:mt-12 md:items-stretch md:justify-start">
								<button
									className={cn(
										'flex grow select-none justify-center whitespace-nowrap rounded-lg px-6 py-3 font-semibold md:grow-0',
										limitExceeded
											? 'bg-foregroundQuaternary text-foregroundTertiary'
											: 'bg-[#FFCF01] text-black shadow-[0_10px_45px_rgba(255,207,1,0.2)]  hover:bg-[#F2C606]'
									)}
									color="transparent"
									onClick={!limitExceeded ? handleCopyLink : undefined}
									disabled={limitExceeded}
								>
									<LinkIcon fill="black" className={limitExceeded ? 'hidden' : 'inline-block'} width={24} height={24} />
									&nbsp;
									{t('Copy invite link')}
								</button>
								<div className="ml-4 flex">
									<TwitterShareButton
										className="mr-3"
										title={t('sharing.twitter.referral', { daoName })}
										url={fullUrl}
										disabled={limitExceeded}
									>
										<div
											className={cn(
												'group flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-[#F2C606] md:h-full',
												{
													'bg-overlayQuarternary pointer-events-none': limitExceeded,
													'bg-[#FFCF01]': !limitExceeded
												}
											)}
										>
											<TwitterIcon
												width={24}
												height={24}
												className={cn('group-hover:fill-backgroundTertiary ', {
													'fill-backgroundPrimary': !limitExceeded,
													'fill-foregroundQuaternary pointer-events-none': limitExceeded
												})}
											/>
										</div>
									</TwitterShareButton>
									<FacebookShareButton url={fullUrl} disabled={limitExceeded}>
										<div
											className={cn(
												'group flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-[#F2C606] md:h-full',
												{
													'bg-overlayQuarternary pointer-events-none': limitExceeded,
													'bg-[#FFCF01]': !limitExceeded
												}
											)}
										>
											<FacebookIcon
												width={24}
												height={24}
												className={cn('group-hover:fill-backgroundTertiary ', {
													'fill-backgroundPrimary': !limitExceeded,
													'fill-foregroundQuaternary pointer-events-none': limitExceeded
												})}
											/>
										</div>
									</FacebookShareButton>
								</div>
								<Link href={`/${slug}`} passHref>
									<a className="bg-white/15 mt-4 block w-full select-none whitespace-nowrap rounded-lg px-6 py-3 text-center font-semibold text-white md:mt-0 md:ml-7 md:mb-0 md:w-auto">
										Go to {daoName}
									</a>
								</Link>
							</div>
						) : (
							<button
								className="mx-auto mt-12 block rounded-lg bg-[#FFCF01] px-6 py-3 text-xl font-semibold text-black shadow-[0_10px_45px_rgba(255,207,1,0.2)] md:mx-0"
								color="transparent"
								onClick={handleOpenAuthModal}
							>
								{t('Connect wallet')}
							</button>
						)}
					</div>

					{/* Desktop version */}
					{tier && tierLink && (
						<TierCard
							tier={tier}
							collectionName={collection?.name}
							limitLeft={referralLinkData?.limitLeft}
							daoName={daoName}
							tierLink={tierLink}
							limitExceeded={limitExceeded}
							className="hidden md:block"
						/>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
};
