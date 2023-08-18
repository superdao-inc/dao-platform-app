import { NextPage } from 'next';
import { useTranslation, Trans } from 'next-i18next';
import styled from '@emotion/styled';

import { shrinkWallet } from '@sd/superdao-shared';
import { colors } from 'src/style';
import { Body } from 'src/components/text';

type Props = {
	displayName?: string | null;
	walletAddress: string;
};

export const EmptyDaos: NextPage<Props> = (props) => {
	const { displayName, walletAddress } = props;

	const { t } = useTranslation();

	const name = displayName || shrinkWallet(walletAddress);

	return (
		<Wrapper>
			<Body color={colors.foregroundSecondary}>
				<Trans i18nKey="pages.userDaos.errors.notFound" t={t} components={{ span: <UserName /> }} values={{ name }} />
			</Body>
		</Wrapper>
	);
};

const UserName = styled.span`
	color: ${colors.foregroundPrimary};
`;

const Wrapper = styled.div`
	background: ${colors.backgroundSecondary};
	border-radius: 8px;

	display: flex;
	padding: 20px 24px;
`;
