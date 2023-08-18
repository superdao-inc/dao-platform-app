import styled from '@emotion/styled';

import { Loader } from 'src/components';

export const MembersLoader = () => (
	<LoaderWrapper>
		<Loader size="lg" color="dark" />
	</LoaderWrapper>
);

const LoaderWrapper = styled.div`
	display: flex;
	justify-content: center;
	padding-top: 8px;
	overflow: hidden;
`;
