import styled from '@emotion/styled';
import Head from 'next/head';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';

import DefaultErrorComponent from 'next/error';

import { colors } from 'src/style';
import { Body, Button, PageContent, Spacer, Title1 } from 'src/components';
import { AuthAPI } from 'src/features/auth/API';

const ErrorPage: NextPage = () => {
	const isAuthorized = AuthAPI.useIsAuthorized();

	const { replace } = useRouter();

	const handleAction = () => {
		if (isAuthorized) replace('/daos');
		else replace('/auth/login');
	};

	return (
		<PageContent>
			<Wrapper>
				<Head>
					<title>Not found</title>
				</Head>

				<Image src="/assets/arts/emptyArt.svg" alt="empty-feed" width={200} height={200} />
				<Spacer height={16} />

				<Title1>Page not found</Title1>
				<Spacer height={8} />

				<Body color={colors.foregroundSecondary}>The link may be broken or the DAO has been deleted</Body>
				<Spacer height={40} />

				<Button
					size="lg"
					label={isAuthorized ? 'Go to my DAOs' : 'Connect wallet to log in'}
					color="accentPrimary"
					onClick={handleAction}
				/>
			</Wrapper>
		</PageContent>
	);
};

ErrorPage.getInitialProps = async (ctx) => {
	return DefaultErrorComponent.getInitialProps(ctx);
};

export default ErrorPage;

const Wrapper = styled.div`
	height: 100vh;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	background: ${colors.backgroundPrimary};
`;
