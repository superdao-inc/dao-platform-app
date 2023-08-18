import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { css } from '@emotion/react';
import { DropdownMenu, SettingsIcon } from 'src/components';

type Props = {
	slug: string;
};

export const Menu = (props: Props) => {
	const { slug } = props;

	const { push } = useRouter();
	const { t } = useTranslation();

	const options = [
		{
			label: t('pages.dao.actions.settings'),
			before: <SettingsIcon />,
			onClick: () => {
				push(`/${slug}/edit`);
			}
		}
	];

	return <DropdownMenu css={dropdownStyles} options={options} data-testid="DaoNavigation__dropdownMenu" />;
};

const dropdownStyles = css`
	margin-left: 12px;
`;
