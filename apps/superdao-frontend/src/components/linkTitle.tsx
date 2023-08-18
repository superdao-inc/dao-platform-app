import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import { ChevronRight } from './assets/icons';
import { Label1, Title2 } from 'src/components/text';
import { transitions, translations } from 'src/style';

export type LinkTitleProps = {
	content: string;
	link?: string;
	amount?: number;
	shouldShowChevron?: boolean;
};

export const LinkTitle: React.FC<LinkTitleProps> = (props) => {
	const { content, link, amount, shouldShowChevron } = props;

	const { t } = useTranslation();

	return (
		<Container link={link}>
			<Header as="a" className="flex items-center justify-between">
				<div className="flex items-center">
					<span className="mr-2">{content}</span>
					<span className="text-foregroundTertiary mr-2">{amount}</span>
					{link && shouldShowChevron && <StyledChevronRight className="hidden lg:block" />}
				</div>
				<Label1 className="text-accentPrimary lg:hidden">{t('actions.labels.seeAll')}</Label1>
			</Header>
		</Container>
	);
};

type ContainerProps = Pick<LinkTitleProps, 'link'> & {
	children: React.ReactNode;
};

const Container: React.FC<ContainerProps> = ({ link, children }) => {
	if (link) {
		return (
			<Link href={link} passHref>
				{children}
			</Link>
		);
	}

	return <>{children}</>;
};

const StyledChevronRight = styled(ChevronRight)`
	margin-left: 2px;
	transition: ${transitions[300]};
`;

const Header = styled(Title2)`
	display: flex;
	align-items: center;
	padding: 16px 0;

	&:hover ${StyledChevronRight} {
		transform: ${translations.horisontal(5)};
		transition: ${transitions[300]};
	}
`;
