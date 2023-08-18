import upperFirst from 'lodash/upperFirst';
import { SubHeading } from 'src/components';
import { colors } from 'src/style';

export const TooltipTiers = (props: { tiers: string[] }) => {
	return (
		<>
			{props.tiers.map((tier, id) => {
				if (id > 8) return;
				return (
					<SubHeading color={id < 8 ? colors.foregroundPrimary : colors.foregroundSecondary} key={tier + id}>
						{id < 8 ? upperFirst(tier) : `+${props.tiers.length - 8} more`}
					</SubHeading>
				);
			})}
		</>
	);
};
