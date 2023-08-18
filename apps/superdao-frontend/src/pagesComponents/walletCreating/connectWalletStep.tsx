import { useTranslation } from 'next-i18next';
import Blockies from 'react-blockies';
import { useCallback, useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';
import { getAddress } from '@sd/superdao-shared';
import { Body, PlusCircleIcon, Label1, SubHeading, PlusIcon, IconButton, toast } from 'src/components';
import { StepProps } from 'src/pagesComponents/walletCreating/types';
import { colors } from 'src/style';
import { useGetSafesList } from 'src/hooks/get-safes';
import { ChevronRight } from 'src/components/assets/icons/chevron-right';
import { useAllWalletsQuery } from 'src/gql/wallet.generated';
import { TreasuryWalletType } from 'src/types/types.generated';
import { useNetworksQuery } from 'src/gql/networks.generated';
import { SkeletonSafes } from './connectStepSkeleton';
import { getWalletClass } from 'src/pagesComponents/walletCreating/style';

type SafesResponse = {
	address: string;
	ownersCount: number;
	confirmators: number;
	chainId?: number;
};

export const ConnectWallet = (props: StepProps) => {
	const { t } = useTranslation();
	const { onStepSuccess, walletAddress, hasAdminRights } = props;

	const { data, isLoading: isWalletsLoading } = useAllWalletsQuery({}, { cacheTime: 0 });

	const networks = useNetworksQuery().data?.networks;

	const wallets = useMemo(() => {
		return data?.allWallets.map(({ address }) => getAddress(address)) || [];
	}, [data]);

	const isUserWalletAlreadyAdded = useMemo(() => {
		return wallets.includes(getAddress(walletAddress) || '');
	}, [wallets, walletAddress]);

	const onGetSafesError = () => toast.error(t('errors.unknownServerError'), { position: 'bottom-center' });

	const [isLoading, getSafesList] = useGetSafesList({ onError: onGetSafesError });

	const [safes, setSafes] = useState<SafesResponse[]>([]);

	const fetchSafes = useCallback(async () => {
		if (!isWalletsLoading) {
			const data = await getSafesList(walletAddress, wallets);
			setSafes(data);
		}
	}, [getSafesList, wallets, walletAddress, isWalletsLoading]);

	useEffect(() => {
		if (!isWalletsLoading) fetchSafes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isWalletsLoading]);

	const handleAddNewSafeClick = () => onStepSuccess({ address: '', type: TreasuryWalletType.Safe });

	const { iconWrapperClass, rowClass } = getWalletClass();

	return (
		<div className={cn('flex flex-col items-start gap-[5px]')}>
			<header className={cn('pl-3 text-[36px] font-bold leading-[48px] text-white')}>
				{t('components.treasury.createWallet.connectWallet.title')}
			</header>
			<Body className="pl-3" color={colors.foregroundSecondary}>
				{t('components.treasury.createWallet.connectWallet.hint')}
			</Body>
			<div className="mt-5 w-11/12">
				{isEmpty(safes) && (isLoading || isWalletsLoading) ? (
					<SkeletonSafes />
				) : (
					<>
						{safes.map(({ address, confirmators, ownersCount, chainId }) => {
							const network = networks?.find((chain) => chain.chainId === chainId)?.title;

							return (
								<div
									className={`${rowClass} mb-2`}
									key={address}
									onClick={() => onStepSuccess({ address, type: TreasuryWalletType.Safe })}
								>
									<Blockies seed={address || ''} className="mr-4 !h-10 !w-10 rounded-[50%]" />
									<div>
										<Label1>{address}</Label1>
										<SubHeading color={colors.foregroundSecondary}>{`${ownersCount} ${t('components.treasury.owners', {
											count: ownersCount
										})} · ${confirmators} ${t('components.treasury.createWallet.connectWallet.confirmators', {
											count: confirmators
										})} · ${network || ''}`}</SubHeading>
									</div>
									<IconButton size="lg" className="my-auto ml-auto" color="transparent" icon={<ChevronRight />} />
								</div>
							);
						})}
						{hasAdminRights && (
							<div className={`${rowClass} mb-2`} onClick={handleAddNewSafeClick}>
								<div className={iconWrapperClass}>
									<PlusCircleIcon fill={colors.foregroundSecondary} />
								</div>
								<div>
									<Label1>{t('components.treasury.createWallet.connectWallet.newSafe.label')}</Label1>
									<SubHeading color={colors.foregroundSecondary}>
										{t('components.treasury.createWallet.connectWallet.newSafe.description')}
									</SubHeading>
								</div>
								<IconButton size="lg" className="my-auto ml-auto" color="transparent" icon={<ChevronRight />} />
							</div>
						)}
						{!isUserWalletAlreadyAdded && (
							<>
								<div
									className={rowClass}
									onClick={() => onStepSuccess({ address: walletAddress, type: TreasuryWalletType.External })}
								>
									<div className={iconWrapperClass}>
										<PlusIcon width={20} height={20} fill={colors.foregroundSecondary} />
									</div>
									<div>
										<Label1>{t('components.treasury.createWallet.connectWallet.addManually.label')}</Label1>
										<SubHeading color={colors.foregroundSecondary}>
											{t('components.treasury.createWallet.connectWallet.addManually.description')}
										</SubHeading>
									</div>
									<IconButton size="lg" className="my-auto ml-auto" color="transparent" icon={<ChevronRight />} />
								</div>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
};
