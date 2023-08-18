import { FC, useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Trans, useTranslation } from 'next-i18next';
import Image from 'next/image';
import {
	contactSupportCustomiseLink,
	getNftTypeData,
	nftSaleGuideLink,
	UNLIMITED_MAX_AMOUNT_VALUE
} from 'src/constants';
import { useUpdateSale } from 'src/pagesComponents/dao/nftEdit/hooks/useManageSale';
import { NftAdminCollectionQuery } from 'src/gql/nftAdmin.generated';
import {
	DEFAULT_SALE_TIME_END,
	DEFAULT_SALE_TIME_START,
	ETH_ADDRESS_REGEX,
	POLYGON_ADDRESS_MAP,
	SaleType
} from '@sd/superdao-shared';

import { borders, colors } from 'src/style';
import {
	ArtworkView,
	Button,
	Caption,
	Checkbox,
	CustomSelect,
	Input,
	Label1,
	SubHeading,
	Switch,
	Title1,
	Title3,
	toast
} from 'src/components';
import { BlockchainButton } from 'src/components/blockchain-button';
import { useConfirmOnUnload } from 'src/hooks/useConfirmOnUnload';
import { getTierCurrency, getTierPrice } from './utils';
import { nftAdminUpdateSaleKey } from 'src/utils/toastKeys';
import { NftTier, SaleConfigInput } from 'src/types/types.generated';
import {
	erc20Tokens,
	nativeTokens,
	PRICE_MAX_VALIDATION,
	PRICE_MIN_VALIDATION,
	PRICE_STEP_VALIDATION,
	TIER_LIMITS_MIN_VALIDATION,
	TIER_LIMITS_STEP_VALIDATION,
	todayMidnight,
	todayMidnightHtml,
	todayNoon
} from 'src/pagesComponents/dao/nftEdit/constants';

type Props = {
	type: SaleType;
	collection: NftAdminCollectionQuery['nftAdminCollection'];
	isLoading: boolean;
	isSaleActive: boolean;
	onCreateTierButtonClick: () => void;
	treasuryWallet?: string | null;
	isTreasuryWalletLoading?: boolean;
	daoAddress: string;
};

export const SalePanel: FC<Props> = (props) => {
	const {
		collection,
		type,
		onCreateTierButtonClick,
		isSaleActive,
		treasuryWallet = '',
		isTreasuryWalletLoading,
		daoAddress
	} = props;

	const { mutateAsync: updateSale, isLoading: isUpdating } = useUpdateSale();

	const { t } = useTranslation();

	const isPublicSale = type === SaleType.Public;

	const currency = getTierCurrency(collection?.tiers[0], isPublicSale);

	const tokenAddress = POLYGON_ADDRESS_MAP[currency as keyof typeof POLYGON_ADDRESS_MAP].address;

	const token = useMemo(() => {
		if (!isPublicSale) {
			return POLYGON_ADDRESS_MAP.MATIC.address;
		}
		return currency ? tokenAddress : POLYGON_ADDRESS_MAP.MATIC.address;
	}, [currency, isPublicSale, tokenAddress]);

	const defaultValues = useMemo<SaleConfigInput>(
		() => ({
			token,
			isActive: isSaleActive,
			prices:
				collection?.tiers.map((tier) => ({
					id: tier.id,
					name: tier.tierName ?? tier.id,
					price: getTierPrice(tier, isPublicSale),
					active: isPublicSale ? tier.salesActivity.openSale : tier.salesActivity.whitelistSale,
					tierLimits: 0
				})) ?? [],
			treasuryWallet: treasuryWallet ?? '',
			claimLimit: 0,
			totalClaimsLimit: 0,
			timeStart: DEFAULT_SALE_TIME_START,
			timeEnd: DEFAULT_SALE_TIME_END
		}),
		[collection, isPublicSale, isSaleActive, token, treasuryWallet]
	);

	const {
		register,
		formState: { errors, isValid, isDirty },
		handleSubmit: handleFormSubmit,
		control,
		getValues,
		reset,
		watch,
		setValue
	} = useForm<SaleConfigInput>({
		defaultValues,
		mode: 'onChange'
	});

	useEffect(() => {
		if (treasuryWallet) {
			setValue('treasuryWallet', treasuryWallet);
		}
	}, [setValue, treasuryWallet]);

	useConfirmOnUnload(isDirty && (t('actions.confirmations.changesWillBeLost') as string));

	const [isActive] = watch(['isActive', 'timeStart']);

	const { fields } = useFieldArray({ control, name: 'prices' });

	const tiersMap = useMemo(() => {
		return collection?.tiers?.reduce<Record<string, NftTier>>((acc, tier) => {
			acc[tier?.tierName ?? tier?.id] = tier;
			return acc;
		}, {});
	}, [collection]);

	const onSaleFormSubmit = async (options: SaleConfigInput) => {
		try {
			toast.loading(t('toasts.updateSale.updating'), {
				position: 'bottom-center',
				id: nftAdminUpdateSaleKey(daoAddress)
			});
			await updateSale({ type, options, daoAddress });
			reset(getValues());
		} catch (error: any) {
			console.error(error);
			toast.dismiss(nftAdminUpdateSaleKey(daoAddress));
			toast.error(t('errors.unknownError'), {
				position: 'bottom-center',
				duration: 5000
			});
		}
	};

	const handleSubmit = handleFormSubmit(onSaleFormSubmit);

	const tokens = isPublicSale ? [...erc20Tokens, ...nativeTokens] : nativeTokens;

	if (!collection?.tiers?.length) {
		return (
			<EmptyTiers>
				<Image src="/assets/arts/editSaleEmptyTiersArt.svg" alt="empty-feed" width={200} height={200} />
				<EmptyTiersTitle>{t('pages.editNfts.sale.noTiers.title')}</EmptyTiersTitle>
				<EmptyTiersSubtitle>{t('pages.editNfts.sale.noTiers.subtitle')}</EmptyTiersSubtitle>
				<Button
					type="button"
					color="accentPrimary"
					size="lg"
					onClick={onCreateTierButtonClick}
					label={t('pages.editNfts.sale.noTiers.button')}
				/>
			</EmptyTiers>
		);
	}

	const testidPrefix = type.toLowerCase() + 'SaleEdit__';

	const isNewSalesFieldsActive = false;

	const getMaxAmount = (tier?: NftTier) => {
		if (!tier) {
			return '';
		}

		if (tier.maxAmount === UNLIMITED_MAX_AMOUNT_VALUE) {
			return 'unlimited';
		}

		const count = tier?.maxAmount! - tier?.totalAmount!;
		const message = `${count} ${t('pages.editNfts.sale.tier.pretext')} ${tier?.maxAmount}`;

		return message;
	};

	return (
		<div className="pb-32">
			<form onSubmit={handleSubmit} className="flex flex-col">
				<div>
					<div className="mb-2">
						<Title3>{t('pages.editNfts.sale.title')}</Title3>
					</div>
					<StyledSubHeading>
						<Trans
							i18nKey="pages.editNfts.sale.subtitleText"
							components={[
								<a href={nftSaleGuideLink} target="_blank" key="0" rel="noreferrer" />,
								<a href={contactSupportCustomiseLink} target="_blank" key="1" rel="noreferrer" />
							]}
						/>
					</StyledSubHeading>
				</div>
				<div>
					<SwitchBox>
						<Switch childrenPosition="after" {...register('isActive')} dataTestId="SalePanel__isActiveSwitch">
							<span className="pl-2 text-white">
								{isActive ? t('pages.editNfts.sale.state.enabled') : t('pages.editNfts.sale.state.disabled')}
							</span>
						</Switch>
					</SwitchBox>
					{isNewSalesFieldsActive ? (
						<div className="mb-4">
							<div className="flex items-start gap-4">
								<div className="basis-2/4">
									<Controller
										name="timeStart"
										control={control}
										rules={{
											required: true,
											min: todayMidnightHtml,
											validate: (value) => {
												if (isNaN(value)) return true;
												// Not modified, valid
												// if (value && tier?.transferUnlockDate === new Date(value).getTime()) return true;
												// Should be after today
												if (!value || new Date(value).getTime() < todayMidnight.getTime()) {
													return t('pages.editNfts.sale.timeStart.dateMinError');
												}
												return true;
											},
											deps: ['timeEnd']
										}}
										render={({ field: { value, name, ref, onChange } }) => {
											const inputValue = new Date(isNaN(value) ? todayNoon : value).getTime();
											return (
												<Input
													ref={ref}
													name={name}
													defaultValue={inputValue}
													type="datetime-local"
													errorClassName="static"
													min={todayMidnightHtml}
													error={errors.timeStart?.message}
													label={t('pages.editNfts.sale.timeStart.label')}
													placeholder={t('pages.editNfts.sale.timeStart.placeholder')}
													onChange={(event) => {
														onChange(new Date(event.currentTarget.value).getTime());
													}}
												/>
											);
										}}
									/>
								</div>
								<div className="flex basis-2/4 flex-col gap-2">
									<Controller
										name="timeEnd"
										control={control}
										rules={{
											required: true,
											min: todayMidnightHtml,
											validate: (value) => {
												if (isNaN(value) || value === 0) return true;
												// Not modified, valid
												// if (value && tier?.transferUnlockDate === new Date(value).getTime()) return true;
												// Should be after today
												if (!value || new Date(value).getTime() < todayMidnight.getTime()) {
													return t('pages.editNfts.sale.timeEnd.dateMinError');
												}

												const timeStart = getValues('timeStart');

												if (new Date(value).getTime() < new Date(timeStart).getTime()) {
													return t('pages.editNfts.sale.timeEnd.dateMinError');
												}

												return true;
											}
										}}
										render={({ field: { name, value, onChange, ref } }) => {
											const inputValue = new Date(isNaN(value) ? todayNoon : value).getTime();
											return (
												<Input
													ref={ref}
													name={name}
													defaultValue={inputValue}
													disabled={value === 0}
													type="datetime-local"
													errorClassName="static"
													error={errors.timeEnd?.message}
													label={t('pages.editNfts.sale.timeEnd.label')}
													placeholder={t('pages.editNfts.sale.timeEnd.placeholder')}
													onChange={(event) => {
														onChange(new Date(event.currentTarget.value).getTime());
													}}
												/>
											);
										}}
									/>
									<Checkbox
										onChange={(event) => setValue('timeEnd', event.currentTarget.checked ? DEFAULT_SALE_TIME_END : 0)}
									>
										<span className="pl-2.5 text-white">{t('pages.editNfts.sale.timeEnd.checkboxLabel')}</span>
									</Checkbox>
								</div>
							</div>
						</div>
					) : null}
					{isNewSalesFieldsActive ? (
						<div className="mb-4">
							<div className="flex items-start gap-4">
								<div className="basis-2/4">
									<Input
										type="number"
										appearance="hide"
										errorClassName="static"
										step={1}
										min={0}
										// TODO: max
										label={t('pages.editNfts.sale.claimLimit.label')}
										placeholder={t('pages.editNfts.sale.claimLimit.placeholder')}
										error={errors.claimLimit?.message}
										{...register('claimLimit', {
											required: true,
											min: 0,
											valueAsNumber: true
										})}
									/>
								</div>
								<div className="basis-2/4">
									<Input
										type="number"
										appearance="hide"
										errorClassName="static"
										step={1}
										min={0}
										// TODO: max
										label={t('pages.editNfts.sale.totalClaimsLimit.label')}
										placeholder={t('pages.editNfts.sale.totalClaimsLimit.placeholder')}
										error={errors.totalClaimsLimit?.message}
										{...register('totalClaimsLimit', {
											required: true,
											min: 0,
											valueAsNumber: true
										})}
									/>
								</div>
							</div>
						</div>
					) : null}
					<SaleConfig>
						<div className="flex items-start gap-4">
							<div className="basis-2/4">
								<Input
									disabled
									errorClassName="static"
									label={t('pages.editNfts.sale.treasuryWallet.label')}
									placeholder={t('pages.editNfts.sale.treasuryWallet.placeholder')}
									error={errors.treasuryWallet?.message}
									isLoading={isTreasuryWalletLoading}
									{...register('treasuryWallet', {
										pattern: {
											value: ETH_ADDRESS_REGEX,
											message: t('pages.editNfts.sale.treasuryWallet.error')
										}
									})}
								/>
							</div>
							<div className="basis-2/4">
								<Label1 className="mb-[8px]">{t('pages.editNfts.sale.token.label')}</Label1>
								<Controller
									name="token"
									control={control}
									render={({ field: { name, value, onChange, ref } }) => {
										return (
											<CustomSelect
												className="basis-2/4"
												innerRef={ref}
												onChange={({ value: newValue }) => onChange(newValue?.value)}
												name={name}
												value={tokens.find((item) => item.value === value)}
												options={tokens}
											/>
										);
									}}
								/>
							</div>
						</div>
						<Caption className="text-foregroundTertiary mt-2">
							{t('pages.editNfts.sale.treasuryWallet.description')}
						</Caption>
					</SaleConfig>
					{fields.map(({ id, name }, index) => {
						const tier = tiersMap?.[name];
						if (tier?.isDeactivated) {
							return null;
						}
						const { TierArtworkTypeIcon } = getNftTypeData(tier?.tierArtworkType);
						const artworks =
							tier?.artworks?.map((artwork) => ({
								id: artwork.id,
								animationUrl: artwork.animationUrl,
								image: artwork.image
							})) ?? [];
						const maxClaimAmount = (tier?.maxAmount ?? 0) - (tier?.totalAmount ?? 0);
						return (
							<TierSection key={id}>
								<Title3 className="mb-[16px]">{t('pages.editNfts.sale.tier.title', { index: index + 1, name })}</Title3>
								<TierData>
									<Artwork showCustomControls={false} artworks={artworks} />
									<TierDescription>
										<Title3 className="mb-0.5">{name}</Title3>
										<Caption css={tierDescriptionCaption} className="mb-1.5">
											{collection?.name} · {getMaxAmount(tier)}
										</Caption>
										<Caption css={tierDescriptionCaption} className="flex gap-1.5">
											{TierArtworkTypeIcon && <TierArtworkTypeIcon fill={colors.foregroundTertiary} />}
											<span>{t(`pages.editNfts.sale.tier.type.${tier?.tierArtworkType ?? 'one'}`)}</span>
										</Caption>
									</TierDescription>
								</TierData>
								<div className="mb-5 flex items-start gap-4">
									<Input
										errorClassName="static"
										type="number"
										step={PRICE_STEP_VALIDATION}
										min={PRICE_MIN_VALIDATION}
										max={PRICE_MAX_VALIDATION}
										appearance="hide"
										label={t('pages.editNfts.sale.tier.price.label')}
										placeholder={t('pages.editNfts.sale.tier.price.placeholder')}
										{...register(`prices.${index}.price`, {
											onChange: (event) => {
												let { value } = event.target;

												const [left, right] = value.split('.');
												if (typeof right !== undefined) {
													if (right) {
														value = `${left}.${right.slice(0, 3)}`;
													} else {
														// Works with '0.'
														return;
													}
												}

												if (value) {
													const parsedValue = parseFloat(value);
													if (parsedValue) {
														value = parsedValue;
													}
												}

												setValue(`prices.${index}.price`, value);
											},
											min: PRICE_MIN_VALIDATION,
											max: PRICE_MAX_VALIDATION,
											setValueAs: (v) => (!v ? null : parseFloat(v))
										})}
										error={errors.prices?.[index]?.price?.message}
									/>
								</div>
								{isNewSalesFieldsActive ? (
									<div className="mb-5 flex items-start gap-4">
										<Input
											type="number"
											appearance="hide"
											errorClassName="static"
											step={TIER_LIMITS_STEP_VALIDATION}
											min={TIER_LIMITS_MIN_VALIDATION}
											label={t('pages.editNfts.sale.tier.tierLimits.label')}
											placeholder={t('pages.editNfts.sale.tier.tierLimits.placeholder')}
											{...register(`prices.${index}.tierLimits`, {
												valueAsNumber: true,
												validate: (value) => {
													if (typeof value !== 'number') {
														return t('pages.editNfts.sale.tier.tierLimits.error');
													}

													if (value && value < TIER_LIMITS_MIN_VALIDATION) {
														return t('pages.editNfts.sale.tier.tierLimits.errorMinValue', {
															min: TIER_LIMITS_MIN_VALIDATION
														});
													}

													if (value && value > maxClaimAmount) {
														return t('pages.editNfts.sale.tier.tierLimits.errorMaxValue', {
															max: maxClaimAmount
														});
													}

													return true;
												}
											})}
											error={errors.prices?.[index]?.tierLimits?.message}
										/>
									</div>
								) : null}
								<Checkbox {...register(`prices.${index}.active`)} data-testid={`${testidPrefix}prices.${index}.active`}>
									<span className="pl-2.5 text-white">{t('pages.editNfts.sale.tier.include')}</span>
								</Checkbox>
							</TierSection>
						);
					})}
					<BlockchainButton
						size="lg"
						color="accentPrimary"
						type="submit"
						disabled={!isValid || !isDirty}
						isLoading={isUpdating}
						label={t('pages.editNfts.sale.save')}
						className="mt-2"
						data-testid={`${testidPrefix}saveButton`}
					/>
				</div>
			</form>
		</div>
	);
};

const StyledSubHeading = styled(SubHeading)`
	& a {
		color: ${colors.accentPrimary};
	}
`;

const SwitchBox = styled.div`
	padding: 12px 16px;
	background: ${colors.backgroundSecondary};
	border-radius: ${borders.medium};
	margin: 24px 0;
`;

const TierData = styled.div`
	display: flex;
	flex-direction: row;
	margin-bottom: 16px;
	gap: 16px;
`;

const TierDescription = styled.div`
	display: flex;
	flex-direction: column;
	margin: auto 0;
`;

const Artwork = styled(ArtworkView)`
	max-width: 80px;
	max-height: 80px;
	min-height: 80px;
	background-color: #c4c4c4;
	border-radius: ${borders.medium};
	overflow: hidden;
`;

const TierSection = styled.div`
	margin-bottom: 36px;

	&:last-child {
		margin-bottom: 46px;
	}
`;

const tierDescriptionCaption = css`
	color: ${colors.foregroundTertiary};
`;

const EmptyTiers = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	min-height: 448px;
	background: ${colors.backgroundSecondary};
	border-radius: ${borders.medium};
`;

const EmptyTiersTitle = styled(Title1)`
	margin-bottom: 8px;
	margin-top: 16px;
`;

const EmptyTiersSubtitle = styled(SubHeading)`
	color: ${colors.foregroundSecondary};
	margin-bottom: 20px;
`;

const SaleConfig = styled.div`
	margin-bottom: 36px;
`;
