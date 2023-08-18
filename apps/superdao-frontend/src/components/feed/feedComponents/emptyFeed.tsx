import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

import { borders, colors } from 'src/style';
import { Body, Title1 } from 'src/components/text';

export const EmptyFeed = () => {
	const { t } = useTranslation();

	return (
		<Wrapper>
			<Image src="/assets/arts/emptyArt.svg" alt="empty-feed" width={228} height={200} />
			<Title>{t('components.feed.empty.title')}</Title>
			<Description>{t('components.feed.empty.description')}</Description>
		</Wrapper>
	);
};

const Wrapper = styled.div`
	width: 100%;
	padding: 48px 84px;

	background: ${colors.backgroundSecondary};
	border-radius: ${borders.medium};

	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Title = styled(Title1)`
	margin-top: 16px;
`;

const Description = styled(Body)`
	margin-top: 8px;
`;
