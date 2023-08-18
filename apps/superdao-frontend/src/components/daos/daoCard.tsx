import { HTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { useRouter } from 'next/router';
import Link from 'next/link';

import { Avatar } from '../common/avatar';
import { Spacer } from '../spacer';
import { Button } from '../button';
import { colors } from 'src/style';
import { Extends } from 'src/utils/types';
import { Label3, Title2 } from 'src/components/text';
import { MemberIcon, MembersIcon } from 'src/components/assets/icons';
import { AllDaosQuery } from 'src/gql/daos.generated';

type CardColor =
	| Extends<
			keyof typeof colors,
			'backgroundPrimary' | 'backgroundSecondary' | 'backgroundTertiary' | 'backgroundQuaternary'
	  >
	| 'transparent';

type StyledDaoCardProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
	width: number;
	color?: CardColor;
};

export type ValuesType<T extends ReadonlyArray<any> | ArrayLike<any> | Record<any, any>> = T extends ReadonlyArray<any>
	? T[number]
	: T extends ArrayLike<any>
	? T[number]
	: T extends object
	? T[keyof T]
	: never;

type DaoCardProps = StyledDaoCardProps & {
	daoPreview: AllDaosQuery['allDaos']['items'][0];
};

export const DaoCard = (props: DaoCardProps) => {
	const { daoPreview, width, color, ...rest } = props;
	const { slug, avatar, name, membersCount } = daoPreview;

	const { push } = useRouter();

	return (
		<Link href={`/${slug}`} passHref>
			<StyledDaoCard width={width} color={color} {...rest}>
				<Avatar fileId={avatar} size="md" />
				<Spacer height={8} />
				<Title2 css={daoNameStyles}>{name}</Title2>

				<StyledMembersContainer>
					<MembersIcon />
					<Label3 css={countStyles}>{membersCount}</Label3>
				</StyledMembersContainer>

				<Button
					css={joinBtnStyles}
					size="lg"
					label="Join"
					color="backgroundSecondary"
					leftIcon={<MemberIcon />}
					onClick={() => push(`/${slug}`)}
				/>
			</StyledDaoCard>
		</Link>
	);
};

const StyledDaoCard = styled.div<StyledDaoCardProps>`
	border: 1px solid ${colors.border};
	padding: 24px;
	border-radius: 8px;

	flex: 1 ${(props) => props.width}px;
	max-width: ${(props) => props.width}px;

	display: flex;
	flex-direction: column;
	justify-content: space-between;

	& > button {
		width: fit-content;
	}

	${(props) => {
		const { color } = props;

		if (!color || color === 'transparent') {
			return css`
				background-color: transparent;
			`;
		}

		return css`
			background-color: ${colors[color]};
			&:hover {
				background-color: rgba(255, 255, 255, 0.08);
			}
		`;
	}}
`;

const daoNameStyles = css`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const StyledMembersContainer = styled.div`
	display: flex;
	margin-top: 2px;
`;

const countStyles = css`
	margin-left: 7px;
	color: ${colors.foregroundSecondary};
`;

const joinBtnStyles = css`
	margin-top: 16px;
	padding-left: 16px;
	gap: 10px;
`;
