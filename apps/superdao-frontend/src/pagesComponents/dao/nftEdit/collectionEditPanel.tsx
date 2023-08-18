import { Trans, useTranslation } from 'next-i18next';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { contactSupportCustomiseLink, nftGuideLink } from 'src/constants';
import { getContractFeatures } from '@sd/superdao-shared';

import { NftAdminCollectionQuery } from 'src/gql/nftAdmin.generated';
import { Body, Button, ChevronRight, Input, SubHeading, Textarea, Title1, Title3, toast } from 'src/components';
import { useSwitch, useUpdateCollection } from 'src/hooks';
import { colors } from 'src/style';
import { BlockchainButton } from 'src/components/blockchain-button';
import { NftEditSkeleton } from 'src/pagesComponents/dao/nftEdit/nftEditSkeleton';
import { nftAdminUpdateCollectionKey } from 'src/utils/toastKeys';
import { filterAttributes, uploadBlobArtworks } from 'src/pagesComponents/dao/nftEdit/utils';
import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';
import { TiersContainer } from './tiersContainer';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { useConfirmOnUnload } from 'src/hooks/useConfirmOnUnload';
import Tooltip from 'src/components/tooltip';
import { NftInfoIcon } from 'src/components/assets/icons/nft';

type Props = {
	collection: NftAdminCollectionQuery['nftAdminCollection'];
	isLoading: boolean;
	daoSlug: string;
	contractAddress: string;
	reloadState(): void;
};

const modalStyles = {
	content: {
		minHeight: '180px',
		height: '180px'
	}
};

const inputStyles = css`
	::placeholder {
		color: ${colors.foregroundTertiary};
	}
`;

export const CollectionEditPanel: FC<Props> = (props) => {
	const { collection: collectionData, isLoading, daoSlug, contractAddress, reloadState } = props;

	const { erc721semver = undefined, ...collection } = collectionData || {};

	const { push } = useRouter();

	const { t } = useTranslation();

	const contractFeatures = getContractFeatures(erc721semver);

	const collectionForm = useForm<NftAdminUpdateCollectionTxInput>({
		mode: 'onChange',
		defaultValues: { ...collection }
	});

	const { register, handleSubmit, formState, reset, watch } = collectionForm;

	const [tiers] = watch(['tiers']);

	const [isModalVisible, { on: showModal, off: closeModal }] = useSwitch(false);

	const { routeChangeDetected, reset: resetRouteChange } = useConfirmOnUnload(
		formState.isDirty && (t('actions.confirmations.changesWillBeLost') as string),
		{
			disableRouteChangeWarning: true,
			enableRouteChange: isModalVisible
		}
	);

	const { mutateAsync: updateCollection } = useUpdateCollection();

	const { isValid, errors, isSubmitting, isDirty } = formState;

	const onSubmit = handleSubmit(async (freshContractData) => {
		if (!collection) return;

		const data = {
			...collection,
			...freshContractData
		};

		data?.tierConfigs?.forEach((config, idx) => (config.position = idx));
		data.tiers = filterAttributes(data?.tiers);
		delete data.collectionAddress;

		for (const promise of data.tiers.map(uploadBlobArtworks)) {
			await promise;
		}

		try {
			toast.loading(t('toasts.updateCollection.updating'), {
				position: 'bottom-center',
				id: nftAdminUpdateCollectionKey(contractAddress)
			});

			await updateCollection({ daoAddress: contractAddress, data });

			reset(data);

			reloadState();
		} catch (error: any) {
			console.error(error);
			// errors with undefined is about unhandler wallet provider :(
			const errorText = error?.message === undefined ? 'noProviderRelogin' : 'unknownError';
			toast.dismiss(nftAdminUpdateCollectionKey(contractAddress));
			toast.error(t(`errors.${errorText}`), {
				position: 'bottom-center',
				duration: 5000
			});
		}
	});

	useEffect(() => {
		if (!isModalVisible && routeChangeDetected) {
			showModal();
		}
	}, [routeChangeDetected, isModalVisible, showModal]);

	const disabled = !isDirty || !isValid || isSubmitting;

	const close = () => {
		closeModal();
		resetRouteChange();
	};

	const openDistributes = (fromModal?: boolean) => {
		if (!fromModal && !disabled) {
			showModal();
			return;
		}
		push(`/${daoSlug}/distribute`);
	};

	const isDistributeBannerVisible = tiers?.length && collectionData?.collectionAddress;

	if (isLoading) {
		return <NftEditSkeleton />;
	}

	return (
		<FormProvider {...collectionForm}>
			<form onSubmit={onSubmit} className="flex flex-col items-start gap-4">
				<StyledSubHeading>
					<Trans
						i18nKey="pages.editNfts.collection.subtitleText"
						components={[
							<a href={nftGuideLink} target="_blank" key="0" rel="noreferrer" />,
							<a href={contactSupportCustomiseLink} target="_blank" key="1" rel="noreferrer" />
						]}
					/>
				</StyledSubHeading>
				<div className="flex w-full gap-4">
					<Input
						label={t('pages.editNfts.collection.name.label')}
						placeholder={t('pages.editNfts.collection.name.placeholder')}
						error={errors.name?.message}
						errorClassName="static"
						css={inputStyles}
						disabled={!contractFeatures?.setName}
						{...register('name')}
					/>
					<Input
						label={
							<div className="flex items-center gap-1.5">
								{t('pages.editNfts.collection.symbol.label')}
								<Tooltip
									content={<SubHeading>Generated after you fill in the name field</SubHeading>}
									placement="right"
								>
									<NftInfoIcon />
								</Tooltip>
							</div>
						}
						placeholder={t('pages.editNfts.collection.symbol.placeholder')}
						error={errors.symbol?.message}
						errorClassName="static"
						css={inputStyles}
						disabled={!contractFeatures?.setSymbol}
						{...register('symbol')}
					/>
				</div>

				<div className="w-full">
					<CustomStyledTextArea
						error={errors.description?.message}
						placeholder={t('pages.editNfts.collection.description.placeholder')}
						label={t('pages.editNfts.collection.description.label')}
						description={t('pages.editNfts.collection.description.description')}
						errorClassName="static"
						rows={1}
						disableMinHeight
						{...register('description')}
					/>
				</div>

				<TiersContainer
					daoSlug={daoSlug}
					contractAddress={contractAddress}
					collectionAddress={collectionData?.collectionAddress || ''}
				/>

				<BlockchainButton
					color="accentPrimary"
					size="lg"
					type="submit"
					label={t('actions.labels.save')}
					className="mt-4"
					isLoading={isSubmitting}
					disabled={disabled}
					data-testid="NftsEdit__saveButton"
				/>
			</form>

			{isDistributeBannerVisible && (
				<div className=" bg-backgroundSecondary relative mt-12 flex h-20 w-full items-center justify-between overflow-hidden rounded-lg py-4 px-6">
					<div>
						<Title3 className="mb-1">Get your NFTs out there</Title3>
						<SubHeading color={colors.foregroundSecondary}>NFTs can be sold, airdropped and more</SubHeading>
					</div>
					<Button
						className="bg-overlaySecondary z-2"
						color="transparent"
						label={
							<div className="flex items-center">
								<StyledHeadline>Distribute NFTs</StyledHeadline>
								<StyledChevron className="ml-2" />
							</div>
						}
						size="md"
						onClick={() => openDistributes()}
					/>
					<LinearGradient />
					<SquareGradient />
				</div>
			)}

			<Modal isOpen={isModalVisible} style={modalStyles}>
				<ModalContent className="pb-6">
					<Title1 className="mb-2">Quitting</Title1>

					<Body className="text-foregroundSecondary max-w-80">
						All changes will be lost. Are you sure want to quit?
					</Body>
				</ModalContent>
				<ModalFooter
					right={
						<>
							<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={close} />
							<Button
								size="lg"
								color="accentNegative"
								label="Don’t save and quit"
								onClick={() => openDistributes(true)}
							/>
						</>
					}
				/>
			</Modal>
		</FormProvider>
	);
};

const StyledChevron = styled(ChevronRight)`
	& path {
		fill: ${colors.foregroundSecondary};
	}
`;

const StyledHeadline = styled(SubHeading)`
	font-weight: 600;
	font-size: 15px;
	line-height: 21px;
	letter-spacing: -0.24px;
`;

const StyledSubHeading = styled(SubHeading)`
	& a {
		color: ${colors.accentPrimary};
	}
`;

const CustomStyledTextArea = styled(Textarea)`
	min-height: 40px;
`;

const LinearGradient = styled.div`
	position: absolute;
	height: 80px;
	width: 458px;
	left: 108px;
	top: 0;
	background: linear-gradient(100.3deg, rgba(255, 159, 26, 0) 17.83%, #ff9f1a 246.42%);
`;

const SquareGradient = styled.div`
	position: absolute;
	width: 253px;
	height: 253px;
	left: 352px;
	top: -57px;
	background: #ff9f1a;
	opacity: 0.15;
	border-radius: 50%;
`;
