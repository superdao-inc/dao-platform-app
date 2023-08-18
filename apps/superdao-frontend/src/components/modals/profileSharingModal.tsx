import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import copy from 'clipboard-copy';

import { BaseModalProps, Modal, ModalContent } from 'src/components/baseModal';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { useDismissibleToast } from 'src/components';

import { FacebookIcon, LinkIcon, TwitterIcon } from '../assets/icons';
import { Input } from '../input';
import { Body, Title1 } from '../text';
import { TwitterShareButton } from '../twitterShareButton';
import { FacebookShareButton } from '../facebookShareButton';

const modalStyles = {
	content: {
		minWidth: 300,
		maxWidth: 400,
		minHeight: 200,
		overflow: 'visible'
	}
};

type Props = BaseModalProps & {
	avatar: ReactNode;
	title: string;
	description: string;
	fullUrl?: string;
	twitterDescription?: string;
	contractAddress?: string | null;
};

export const ProfileSharingModal = (props: Props) => {
	const { avatar, title, description, fullUrl, twitterDescription, isOpen, contractAddress, onClose } = props;

	const { t } = useTranslation();

	const copyToast = useDismissibleToast(t('actions.confirmations.linkCopy'));

	const { data: collectionData, isLoading } = useNftCollectionQuery(
		{ daoAddress: contractAddress! },
		{ enabled: !!contractAddress }
	);

	if (isLoading) return null;

	const handleCopyLink = () => {
		try {
			navigator.share({ url: fullUrl });
		} catch {
			copy(fullUrl ?? '').then(() => copyToast.show());
		}
	};

	const handleModalClose = () => {
		copyToast.hide();
		onClose();
	};

	const tiers = collectionData?.collection.tiers.filter((tier) => !tier.isDeactivated);
	const renderableTiers = tiers?.filter((tier) => tier.artworks[0]?.image);

	const allTiersCount = tiers?.length ?? 0;
	const renderableTiersCount = renderableTiers?.length ?? 0;

	const hasUnrenderableTiers = allTiersCount !== renderableTiersCount;
	const isTruncateCase = hasUnrenderableTiers || renderableTiersCount > 4;

	const renderableTiersTruncatedCount = renderableTiersCount > 3 ? 3 : renderableTiersCount;
	const finalRenderCount = isTruncateCase ? renderableTiersTruncatedCount : renderableTiersCount;

	const previewTiers = renderableTiers?.slice(0, finalRenderCount);
	const unrenderedTiersCount = allTiersCount - renderableTiersTruncatedCount;

	return (
		<Modal isOpen={isOpen} withCloseIcon onClose={handleModalClose} style={modalStyles}>
			{avatar}
			<ModalContent withFooter={false} className="mb-0 pb-6" data-testid={'ProfileSharingModal__wrapper'}>
				<Title1 className="mt-8 w-full text-center" data-testid={'ProfileSharingModal__name'}>
					{title}
				</Title1>
				<Body className="line-clamp-3 mt-1 w-full text-center" data-testid={'ProfileSharingModal__description'}>
					{description}
				</Body>

				{!!renderableTiers?.length && (
					<div className="relative mt-6 flex w-full justify-center gap-3">
						{previewTiers?.map((tier) => (
							<div
								key={tier.id}
								className="bg-backgroundPrimary flex aspect-square max-h-[60px] max-w-[60px] flex-1 items-center justify-center rounded-lg before:pt-[100%] sm:max-h-[80px] sm:min-w-[80px]"
								data-testid={`ProfileSharingModal__previewTier${tier.id}`}
							>
								<img className="max-h-full max-w-full rounded-lg" src={tier.artworks[0].image!} />
							</div>
						))}
						{isTruncateCase && (
							<div className="bg-backgroundPrimary flex aspect-square max-h-[60px] max-w-[60px] flex-1 items-center justify-center rounded-lg before:pt-[100%] sm:max-h-[80px] sm:min-w-[80px]">
								<Body className="text-foregroundTertiary">+{unrenderedTiersCount}</Body>
							</div>
						)}
					</div>
				)}

				<div className="mt-6">
					<Input
						readOnly
						value={fullUrl}
						leftIcon={<LinkIcon width={20} height={20} />}
						rightIcon={
							<Body onClick={handleCopyLink} className="text-accentPrimary cursor-pointer">
								{t('actions.labels.copy')}
							</Body>
						}
						data-testid={'ProfileSharingModal__daoLink'}
					/>
				</div>

				<div className="relative mt-5 flex h-10 w-full gap-4">
					<TwitterShareButton
						className="flex-1"
						title={twitterDescription}
						url={fullUrl}
						data-testid={'ProfileSharingModal__twitterButton'}
					>
						<div className="bg-backgroundTertiary hover:bg-backgroundTertiaryHover flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg transition-all">
							<TwitterIcon width={24} height={24} />
						</div>
					</TwitterShareButton>
					<FacebookShareButton className="flex-1" url={fullUrl} data-testid={'ProfileSharingModal__facebookButton'}>
						<div className="bg-backgroundTertiary hover:bg-backgroundTertiaryHover flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg transition-all">
							<FacebookIcon width={24} height={24} />
						</div>
					</FacebookShareButton>
				</div>
			</ModalContent>
		</Modal>
	);
};
