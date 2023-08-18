import Blockies from 'react-blockies';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import { useRouter } from 'next/router';
import { useState } from 'react';
import { DropdownMenu, Ellipsis, Label1, SettingsIcon, SubHeading, TrashIcon } from 'src/components';
import { colors } from 'src/style';
import { shrinkWallet } from '@sd/superdao-shared';
import { formatUsdValue } from 'src/utils/formattes';
import { CommonWalletFragment } from 'src/gql/treasury.generated';
import { RemoveWalletModal } from 'src/components/modals/removeWalletModal';
import { Star } from 'src/components/assets/icons/star';

type Props = {
	wallet: CommonWalletFragment;
	slug: string;
	daoId: string;
	isEditable?: boolean;
};

export const TreasuryWallet = (props: Props) => {
	const { t } = useTranslation();
	const { push, asPath } = useRouter();

	const [isRemoveModalOpen, setRemoveModalIsOpen] = useState(false);

	const {
		wallet: { name, address, id, valueUsd, tokensBalance, main },
		slug,
		daoId,
		isEditable
	} = props;

	const assets = tokensBalance.map(({ token: { iconUrl } }) => iconUrl);
	const openWalletEditPage = () => push(`/${slug}/treasury/wallets/${id}/edit?from=${asPath}`);

	return (
		<>
			<Link href={`/${slug}/treasury/wallets/${id}`} passHref>
				<div
					className="mb-4 flex cursor-pointer justify-between last:mb-0"
					data-testid={`TreasuryWallet__wrapper${id}`}
				>
					<div className="relative mr-4" data-testid={'TreasuryWallet__avatar'}>
						<Blockies className="before rounded-full" size={10} seed={id || ''} />
						{main && (
							<div className="absolute bottom-px -right-px">
								<div className="bg-accentPrimary border-backgroundSecondary rounded-full border-2 p-0.5">
									<Star />
								</div>
							</div>
						)}
					</div>
					<div className="main flex-1">
						<div className="top flex items-center">
							<div className="left-side  flex flex-1">
								<div className="main-info">
									<div className="flex items-center">
										<Ellipsis className="max-w-[400px]" as={Label1} data-testid={'TreasuryWallet__name'}>
											{name}
										</Ellipsis>
										<SubHeading
											className="ml-1"
											color={colors.foregroundTertiary}
											data-testid={'TreasuryWallet__wallet'}
										>
											{shrinkWallet(address ?? '')}
										</SubHeading>
									</div>
									<SubHeading
										color={colors.foregroundSecondary}
										data-testid={'TreasuryWallet__assets'}
									>{`${formatUsdValue(valueUsd)} USD${assets.length ? ` · ${assets.length} assets` : ''}`}</SubHeading>
								</div>
							</div>

							<div className="right-side flex" data-testid={'TreasuryWallet__dropdownMenu'}>
								{isEditable && (
									<DropdownMenu
										options={[
											{
												label: t('components.treasury.settingsDropdown.settings'),
												before: <SettingsIcon width={22} height={22} fill={colors.foregroundSecondary} />,
												onClick: openWalletEditPage
											},
											{
												label: t('components.treasury.settingsDropdown.remove'),
												color: colors.accentNegative,
												before: <TrashIcon width={22} height={22} fill={colors.accentNegative} />,
												onClick: () => setRemoveModalIsOpen(true)
											}
										]}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</Link>
			<RemoveWalletModal
				isOpen={isRemoveModalOpen}
				onClose={() => setRemoveModalIsOpen(false)}
				id={id}
				address={address}
				slug={slug}
				daoId={daoId}
			/>
		</>
	);
};
