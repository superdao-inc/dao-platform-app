import Link from 'next/link';
import styled from '@emotion/styled';
import { colors } from 'src/style';
import { Label1, SubHeading } from 'src/components';

type Props = {
	id: string;
	title: string;
	description: string;
	amount: string;
	slug: string;
};

export const DaoWalletsList = (props: Props) => {
	const { id, slug, title, description, amount } = props;

	return (
		<Link href={`/${slug}/treasury/wallets/${id}`} passHref>
			<ListItem>
				<ListItemContent>
					<Label1>{title}</Label1>
					<SubHeading color={colors.foregroundSecondary}>{description}</SubHeading>
					<SubHeading color={colors.foregroundSecondary}>{amount}</SubHeading>
				</ListItemContent>
			</ListItem>
		</Link>
	);
};

const ListItem = styled.a`
	padding: 8px 12px;
	border-radius: 8px;
	width: 100%;

	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}
`;

const ListItemContent = styled.span`
	display: block;
	flex: 1;
`;
