import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback } from 'react';
import { CrossIcon, IconButton, Input, SearchIcon } from 'src/components';

type Props = {
	value: string;
	onChange: (value: string) => void;
};

export const DaoMembersSearch = (props: Props) => {
	const { value, onChange } = props;

	const { t } = useTranslation();

	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value), [onChange]);
	const handleReset = useCallback(() => onChange(''), [onChange]);

	return (
		<div className="flex-1">
			<Input
				value={value}
				onChange={handleChange}
				placeholder={t('pages.dao.members.actions.search')}
				leftIcon={<SearchIcon />}
				renderRight={
					!!value.length && (
						<IconButton
							size="lg"
							color="transparent"
							className="group"
							isSymmetric
							icon={<CrossIcon className="fill-foregroundTertiary group-hover:fill-foregroundSecondary ease-in-out" />}
							onClick={handleReset}
						/>
					)
				}
				data-testid="DaoMembers__searchInput"
			/>
		</div>
	);
};
