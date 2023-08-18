import styled from '@emotion/styled';

export const PublicNavigation = () => {
	return (
		<Wrapper>
			<a href="https://superdao.co/" target="_blank" rel="noreferrer">
				<Logo width="36px" height="36px" src="/logo.svg" />
			</a>
		</Wrapper>
	);
};

const Wrapper = styled.nav`
	position: sticky;
	top: 0;
	bottom: 0;
	left: 0;

	display: flex;
	flex-direction: column;

	height: 100vh;
`;

const Logo = styled.img`
	margin: 16px 14px 20px;
	width: 36px;
	height: 36px;
`;
