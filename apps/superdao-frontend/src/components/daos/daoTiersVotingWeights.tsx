import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { Control, FieldErrors, useFieldArray, UseFormRegister } from 'react-hook-form';
import { Label1 } from 'src/components/text';
import { NftTier } from 'src/types/types.generated';
import { VotingFields } from 'src/validators/daos';
import { Input } from '../input';

type Props = {
	register: UseFormRegister<VotingFields>;
	control: Control<VotingFields>;
	errors: FieldErrors<VotingFields>;
	tiersInfo: NftTier[];
};

export const DaoTiersVotingWeights = (props: Props) => {
	const { tiersInfo, register, control, errors } = props;
	const { fields: tiers } = useFieldArray({
		control,
		name: 'tiersVotingWeights'
	});

	const getTierInfoById = useCallback(
		(tierId: string) => {
			return tiersInfo.find((tier) => tier.id === tierId);
		},
		[tiersInfo]
	);

	const { t } = useTranslation();

	return (
		<div className="flex w-full flex-col">
			<div className="flex w-full gap-4">
				<div className="w-full">
					<div className="mb-4 flex gap-4 last:mb-0">
						<Label1 className="mb-2 w-full">{t('components.dao.settings.voting.tier')}</Label1>
						<Label1 className="mb-2 w-full">{t('components.dao.settings.voting.weight')}</Label1>
					</div>
					{tiers.map((tier, index) => {
						const tierInfo = getTierInfoById(tier.tierId);
						const image = tierInfo?.artworks[0]?.image;
						const error = errors.tiersVotingWeights?.[index]?.weight?.message;
						return (
							<div className="mb-4 flex gap-4 last:mb-0" key={tier.tierId}>
								<Input
									leftIcon={<img className="h-6 w-6 rounded-full" src={image || '/assets/unknown-asset.png'} />}
									readOnly
									disabled
									className="w-full"
									value={tierInfo?.tierName ? tierInfo.tierName : tier.tierId}
								/>
								<Input
									className="w-full"
									placeholder={'1'}
									error={error}
									{...register(`tiersVotingWeights.${index}.weight`, {
										setValueAs: (val) => parseInt(val, 10),
										valueAsNumber: true
									})}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
