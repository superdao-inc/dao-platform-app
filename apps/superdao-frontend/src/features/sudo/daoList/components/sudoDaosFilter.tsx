import { ChangeEvent, useCallback, useState } from 'react';
import { Button, Checkbox, Title2 } from 'src/components';
import { AllDaosFilter } from 'src/types/types.generated';

type Props = {
	onSubmit: (values: any) => void;
};

export const SudoDaosFilter = (props: Props) => {
	const { onSubmit } = props;

	const [values, setValues] = useState<AllDaosFilter>({
		isInternal: false
	});

	const handleChange = useCallback(
		(key: keyof AllDaosFilter) => (e: ChangeEvent<HTMLInputElement>) => {
			setValues({
				...values,
				[key]: e.target.checked
			});
		},
		[values]
	);

	return (
		<div className="flex w-[300px] flex-col gap-2 text-white">
			<Title2>Filters</Title2>

			<Checkbox onChange={handleChange('isInternal')}>Internal</Checkbox>

			<Button color="accentPrimary" size="lg" label={'Submit'} onClick={() => onSubmit(values)} />
		</div>
	);
};
