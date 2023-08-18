import { shrinkWallet } from '@sd/superdao-shared';
import { Ellipsis, Label1, SubHeading } from 'src/components';
import { Star } from 'src/components/assets/icons/star';
import { CommonWalletFragment } from 'src/gql/treasury.generated';
import { colors } from 'src/style';
import { formatUsdValue } from 'src/utils/formattes';

type Props = {
	wallet: CommonWalletFragment;
};

export const TreasuryWalletMobile = (props: Props) => {
	const {
		wallet: { name, address, valueUsd, tokensBalance, main }
	} = props;

	const assets = tokensBalance.map(({ token: { iconUrl } }) => iconUrl);

	return (
		<>
			<div className="flex justify-between pb-4" data-testid={`TreasuryWallet__wrapper${props.wallet.id}`}>
				<div className="relative flex flex-col items-start">
					<div className="flex items-center">
						<Ellipsis className="max-w-[400px]" as={Label1} data-testid={'TreasuryWallet__name'}>
							{name}
						</Ellipsis>
						{main && <Star height={14} width={14} starcolor={colors.accentPrimary} className="ml-1" />}
					</div>
					<SubHeading color={colors.foregroundSecondary} data-testid={'TreasuryWallet__wallet'}>
						{shrinkWallet(address ?? '')}
					</SubHeading>
				</div>
				<div className="flex flex-col items-end justify-between" data-testid={'TreasuryWallet__assets'}>
					<SubHeading color={colors.foregroundPrimary}>{`$${formatUsdValue(valueUsd)}`}</SubHeading>
					<SubHeading color={colors.foregroundSecondary}>{`${
						assets.length ? `${assets.length} assets` : ''
					}`}</SubHeading>
				</div>
			</div>
		</>
	);
};
