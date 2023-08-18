import { useTranslation } from 'next-i18next';

import { css } from '@emotion/react';
import { borders, colors } from 'src/style';

import { Caption } from 'src/components/text';

import { getRoleTranslationKey } from 'src/utils/roles';
import { DaoMemberRole } from 'src/types/types.generated';

type Props = {
	role: DaoMemberRole | undefined;
};

export const RoleLabel = (props: Props) => {
	const { role } = props;
	const { t } = useTranslation();

	if (!role) return null;

	const roleKey = getRoleTranslationKey(role);
	switch (roleKey) {
		case 'roles.creator':
			return (
				<Caption css={[defaultLabelStyles, adminRoleStyles]} data-testid="Caption__creatorLabel">
					{t(roleKey)}
				</Caption>
			);

		case 'roles.admin':
			return (
				<Caption css={[defaultLabelStyles, adminRoleStyles]} data-testid="Caption__creatorLabel">
					{t(roleKey)}
				</Caption>
			);

		case 'roles.member':
			return (
				<Caption css={[defaultLabelStyles, memberRoleStyles]} data-testid="Caption__memberLabel">
					{t(roleKey)}
				</Caption>
			);

		default:
			return null;
	}
};

const defaultLabelStyles = css`
	padding: 3px 12px;
	border-radius: ${borders.small};
`;

const memberRoleStyles = css`
	color: ${colors.greenYellow};
	background-color: rgba(134, 240, 69, 0.07);
`;

const adminRoleStyles = css`
	background-color: rgba(54, 190, 217, 0.15);
	color: ${colors.tintCyan};
`;
