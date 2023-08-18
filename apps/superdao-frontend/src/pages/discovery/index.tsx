import styled from '@emotion/styled';
import { css, Global } from '@emotion/react';

import { useTranslation } from 'next-i18next';

import { Body, DaoCard, Input, PageContent, Spacer, Title1 } from 'src/components';
import { SearchIcon } from 'src/components/assets/icons';
import { Loader } from 'src/components/common/loader';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { colors } from 'src/style';
import { useAllDaosQuery } from 'src/gql/daos.generated';
import { CustomHead } from 'src/components/head';

const Discovery = () => {
	const { isLoading, isError, data: allDaos, error } = useAllDaosQuery();
	const { allDaos: getAllDaosResponse } = allDaos || {};

	const { t } = useTranslation();

	let content = null;
	if (isError) {
		content = (
			<StyledNegativeMessage>
				Error: {error ? (error as any).message : t('errors.unknownServerError')}
			</StyledNegativeMessage>
		);
	} else {
		content =
			getAllDaosResponse!.items.length === 0 ? (
				<Body>No daos found</Body>
			) : (
				<StyledDaoCardsList>
					{getAllDaosResponse!.items.map((daoPreview) => (
						<DaoCard key={daoPreview.slug} daoPreview={daoPreview} width={243} color="backgroundPrimary" />
					))}
				</StyledDaoCardsList>
			);
	}

	return (
		<>
			<Global styles={globalStyles} />
			<PageContent>
				<CustomHead main={'Discovery'} additional={'Superdao'} description={'DAOs discovery'} />

				<Container>
					<Spacer height={24} />
					{content}
					<Title1>Discovery</Title1>
					<Spacer height={20} />
					<Input placeholder="Search" leftIcon={isLoading ? <Loader /> : <SearchIcon />} alt="" />
					<Spacer height={24} />
				</Container>
			</PageContent>
		</>
	);
};

export default Discovery;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

const globalStyles = css`
	html {
		width: 100%;
		overflow-x: hidden;
	}
`;

const Container = styled.div`
	max-width: 760px;
	margin: auto auto;

	box-sizing: border-box;
`;

const StyledDaoCardsList = styled.div`
	display: flex;
	justify-content: space-around;
	flex-flow: row wrap;

	gap: 14px;

	&::after {
		content: '';
		flex: auto;
	}
`;

const StyledNegativeMessage = styled.span`
	color: ${colors.accentNegative};
`;
