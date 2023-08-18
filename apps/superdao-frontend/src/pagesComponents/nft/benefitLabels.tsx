import cn from 'classnames';
import { Label2 } from 'src/components';

//Пока что просто верстка компонента, вероятно изменится весь
export const BenefitLabels = () => {
	const benefits = [
		{
			title: '+150 XP',
			type: 'premium'
		},
		{
			title: 'Access to dao',
			type: 'default'
		}
	];
	return (
		<div>
			<div className="flex gap-3">
				{benefits.map((benefit) => (
					<div
						key={benefit.title}
						className={cn('rounded-lg px-3 py-2', {
							'bg-overlayTintCyan': benefit.type === 'premium',
							'bg-overlayModal': benefit.type === 'default'
						})}
					>
						<Label2
							className={cn({
								'text-tintCyan': benefit.type === 'premium',
								'text-foregroundPrimary': benefit.type === 'default'
							})}
						>
							{benefit.title}
						</Label2>
					</div>
				))}
			</div>
		</div>
	);
};
