import { useTranslation } from 'next-i18next';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';
import {
	ArtworkView,
	Body,
	BoldPlusIcon,
	Button,
	Caption,
	Checkbox,
	CustomSelect,
	Label1,
	Label3,
	Loader,
	LoaderWrapper,
	NegativeIcon,
	NftToastContent,
	Title1,
	toast
} from 'src/components';
import { BlockchainButton } from 'src/components/blockchain-button';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { borders, colors } from 'src/style';
import { useBanUser, useRemoveWhitelistWallet, useToggle } from 'src/hooks';
import { banMemberKey, burnNftKey, removeWhitelistWalletKey } from 'src/utils/toastKeys';
import { useCount } from 'src/hooks/use-counter';
import { useUserNftsByDaoQuery } from 'src/gql/nft.generated';
import { MetamaskError } from 'src/types/metamask';
import { SelectNftProps } from './nftSelect';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	daoId: string;
	userId: string;
	userName: string;
	daoAddress: string;
	banType: 'member' | 'whitelist';
};

type BanningNftProps = {
	amount: number;
	image?: string | null;
	animationUrl?: string | null;
	collectionName: string | null;
	tierName: string;
	tierId: string;
	tokenIds: string[];
	onChange: (tierId: string, count: number) => void;
};

const modalStyle = {
	content: {
		minHeight: 145,
		minWidth: 'min(400px, calc(100vw - 36px))',
		width: 'min(400px, calc(100vw - 36px))',
		maxWidth: 400,
		maxHeight: 'calc(100vh - 112px)',
		overflow: 'visible'
	}
};

export const BanMemberModal = (props: Props) => {
	const { isOpen, onClose, userId, daoId, userName, daoAddress, banType } = props;
	const { t } = useTranslation();

	const typeBanHook = banType === 'whitelist' ? useRemoveWhitelistWallet : useBanUser;
	const { data: nftsByDao, isLoading: isLoadingNfts } = useUserNftsByDaoQuery({ userId, daoAddress });
	const nfts = nftsByDao?.userNftsByDao;

	const [isChoosingSelected, setChoosingSelected] = useState(false);
	const [tokenIds, setTokenIds] = useState<Record<string, string[]>>({});

	const flattenedTokenIds = useMemo(() => Object.values(tokenIds).flat(), [tokenIds]);

	const toastData = {
		title:
			banType === 'whitelist'
				? t('toasts.whitelist.loading.title_one_remove', { count: 1 })
				: t(`toasts.${flattenedTokenIds.length === nfts?.length ? 'banMember' : 'burnNft'}.loading.title`, {
						name: userName,
						count: flattenedTokenIds.length,
						prefix: flattenedTokenIds.length > 1 ? 's' : ''
				  }),
		key:
			banType === 'whitelist'
				? removeWhitelistWalletKey(userName, daoId)
				: flattenedTokenIds.length === nfts?.length
				? banMemberKey(userName, daoId)
				: burnNftKey(userName, daoId)
	};

	const { mutate: banUser, isLoading } = typeBanHook();

	const handleSuccessTransaction = () => {
		toast.loading(<NftToastContent title={toastData.title} />, {
			position: 'bottom-center',
			id: toastData.key
		});
	};

	const handleClose = () => {
		toast.dismiss(toastData.key);
		onClose();
	};

	const handleBanMember = async () => {
		handleSuccessTransaction();
		banUser(
			{ userId, daoAddress, tokenIds: flattenedTokenIds, nftCount: nfts?.length },
			{
				onSuccess: onClose,
				onError: (error) => {
					toast.dismiss(toastData.key);
					let metamaskErrorMessage = t(`errors.metamask.${(error as MetamaskError).code}`, '');

					toast.error(metamaskErrorMessage || t('toasts.banMember.failed', { name: userName }), {
						position: 'bottom-center',
						duration: 5000
					});
					onClose();
				}
			}
		);
	};

	const prefixTextByType = banType === 'whitelist' ? 'Whitelist' : '';

	const handleSelectChange = ({ value: target }: any) => {
		if (target.value === 'choose') return setChoosingSelected(true);
		setChoosingSelected(false);
	};

	const banningNfts = useMemo(() => {
		const arr = nfts?.reduce((a: Record<string, Omit<BanningNftProps, 'tierId' | 'onChange'>>, e) => {
			const tierId = e.tierId;
			const rest = a[tierId]?.tokenIds || [];
			const res = {
				amount: a[tierId]?.amount + 1 || 1,
				tokenIds: [...rest, e.tokenId],
				image: e.metadata?.image,
				animationUrl: e.metadata?.animationUrl,
				collectionName: e.name,
				tierName: e.tierName
			};
			a[tierId] = res;
			return a;
		}, {} as Record<string, BanningNftProps>);
		return arr || {};
	}, [nfts]);

	const options: SelectNftProps[] = useMemo(() => {
		return [
			{ value: 'all', label: `Burn all (${nfts?.length}) NFTs` },
			{ value: 'choose', label: 'Choose NFTs to burn' }
		];
	}, [nfts]);

	const handleChangeNft = useCallback(
		(tierId: string, count: number) => {
			if (count > 0) {
				const newTokenIds = banningNfts[tierId].tokenIds.filter((_, index) => count - 1 >= index);
				setTokenIds((current) => ({ ...current, [tierId]: newTokenIds }));
			} else {
				setTokenIds((current) => {
					const rest = { ...current };
					delete rest[tierId];
					return rest;
				});
			}
		},
		[setTokenIds, banningNfts]
	);

	useEffect(() => {
		if (!isChoosingSelected) {
			Object.entries(banningNfts).map(([tierId, nft]) => {
				handleChangeNft(tierId, nft.amount);
			});
		}
	}, [isChoosingSelected, banningNfts, handleChangeNft]);

	const btnLabel = useMemo(() => {
		if (banType === 'whitelist') return t(`pages.dao.banModal.button${prefixTextByType}`);
		return !flattenedTokenIds.length
			? 'No NFTs selected'
			: flattenedTokenIds.length !== nfts?.length
			? t(`pages.dao.banModal.buttonBurnOnly`, { count: flattenedTokenIds?.length })
			: t(`pages.dao.banModal.buttonBurnAndBan`, { count: nfts?.length });
	}, [nfts, banType, t, prefixTextByType, flattenedTokenIds]);

	const isBtnDisabled = isLoading || isLoadingNfts || (Boolean(!flattenedTokenIds.length) && banType !== 'whitelist');

	return (
		<Modal style={modalStyle} isOpen={isOpen} onClose={onClose}>
			<ModalContent
				className={`${
					isChoosingSelected && Object.keys(banningNfts).length > 1 ? 'overflow-auto' : 'overflow-visible'
				}`}
			>
				<Title1 className="mb-2" color={colors.foregroundPrimary}>
					{t(`pages.dao.banModal.title${prefixTextByType}`, { userName })}
				</Title1>
				{banType !== 'member' ? (
					<div className="m-auto w-fit">
						<Image src={'/assets/arts/mascotSeat.svg'} width={190} height={193} />
					</div>
				) : !isLoadingNfts ? (
					<>
						<Body className="mb-5" color={colors.foregroundPrimary}>
							{t(`pages.dao.banModal.description${prefixTextByType}`)}
						</Body>

						<CustomSelect name="select-ban" options={options} defaultValue={options[0]} onChange={handleSelectChange} />
						{isChoosingSelected && (
							<div className={`mt-4 overflow-y-scroll ${Object.keys(banningNfts).length > 8 && 'pb-16'}`}>
								{!isLoadingNfts &&
									Object.entries(banningNfts).map(
										([tierId, { amount, image, animationUrl, collectionName, tierName }]) => {
											return (
												<BanningNft
													amount={amount}
													image={image}
													animationUrl={animationUrl}
													collectionName={collectionName}
													tierName={tierName}
													tierId={tierId}
													key={tierId}
													onChange={handleChangeNft}
												/>
											);
										}
									)}
							</div>
						)}
					</>
				) : (
					<LoaderWrapper>
						<Loader size="xl" />
					</LoaderWrapper>
				)}
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={handleClose} />
						<BlockchainButton
							size="lg"
							color="accentNegative"
							label={btnLabel}
							onClick={handleBanMember}
							disabled={isBtnDisabled}
							isLoading={isLoading}
						/>
					</>
				}
			/>
		</Modal>
	);
};

const BanningNft = (props: Omit<BanningNftProps, 'tokenIds'>) => {
	const { amount, tierName, tierId, collectionName, image, animationUrl, onChange } = props;
	const [isSelected, toggleSelected] = useToggle(false);
	const { t } = useTranslation();
	const { count, increment, decrement } = useCount({
		min: 1,
		max: amount,
		defaultValue: amount
	});

	useEffect(() => {
		onChange(tierId, isSelected ? count : 0);
	}, [count, isSelected, tierId, onChange]);

	return (
		<div className="mb-4 flex items-center justify-between last:mb-0">
			<div className="flex items-center">
				<StyledArtwork artworks={[{ image, animationUrl }]} />
				<div className="ml-3">
					<Label1>{collectionName}</Label1>
					<Caption color={colors.foregroundTertiary} className="flex items-center gap-1">
						{tierName}
						<Dot />
						{amount} {t('components.nft.units', { prefix: amount > 1 ? 's' : '' })}
					</Caption>
				</div>
			</div>
			<div className="flex h-5 items-center">
				{amount > 1 && <BanCounter count={count} disabled={!isSelected} increment={increment} decrement={decrement} />}
				<Checkbox checked={isSelected} onChange={toggleSelected} />
			</div>
		</div>
	);
};

const Dot = styled.div`
	width: 3px;
	height: 3px;
	border-radius: 50%;
	background-color: ${colors.foregroundQuaternary};
`;

const StyledArtwork = styled(ArtworkView)`
	width: 48px;
	height: 48px;
	border-radius: ${borders.small};
`;

const BanCounter = ({
	count,
	increment,
	decrement,
	disabled
}: {
	count: number;
	increment: () => void;
	decrement: () => void;
	disabled: boolean;
}) => {
	return (
		<Wrapper disabled={disabled}>
			<NegativeIcon onClick={decrement} />
			<Label3>{count}</Label3>
			<BoldPlusIcon onClick={increment} />
		</Wrapper>
	);
};

const Wrapper = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 7px 14px;
	margin-right: 14px;
	background-color: ${colors.overlaySecondary};
	border-radius: ${borders.medium};
	pointer-events: ${(props) => props.disabled && 'none'};
	${Label3} {
		color: ${(props) => props.disabled && colors.foregroundTertiary};
		margin: 0 10px;
	}
	svg {
		fill: ${(props) => (props.disabled ? colors.foregroundTertiary : colors.foregroundSecondary)};
		cursor: ${(props) => !props.disabled && 'pointer'};
	}
`;
