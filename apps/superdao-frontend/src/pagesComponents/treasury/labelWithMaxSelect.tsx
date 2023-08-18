import { PropsWithChildren } from 'react';
import { useTranslation } from 'next-i18next';
import { Label, Label1, Label3 } from 'src/components';
import { colors } from 'src/style';

type Props = PropsWithChildren<{
	label: string;
	maxAvailable: number | null;
	onMaxSelect: () => void;
}>;

export const LabelWithMaxSelect = (props: Props) => {
	const { label, maxAvailable, onMaxSelect, children } = props;

	const { t } = useTranslation();

	return (
		<div className="relative w-full">
			<div className="flex items-center justify-between">
				<Label>{label}</Label>

				{!!maxAvailable && (
					<>
						<Label1 className="mx-2 mb-2">{maxAvailable}</Label1>

						<div className="mb-2 flex-1 text-right">
							<Label3 className="inline cursor-pointer py-2" color={colors.accentPrimary} onClick={onMaxSelect}>
								{t('actions.labels.sendMax')}
							</Label3>
						</div>
					</>
				)}
			</div>

			{children}
		</div>
	);
};
