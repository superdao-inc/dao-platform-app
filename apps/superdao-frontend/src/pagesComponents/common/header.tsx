import styled from '@emotion/styled';

import { Title1 } from 'src/components/text';

export const Header = styled.header`
	padding: 20px 0;

	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Name = styled(Title1)`
	display: flex;
	align-items: center;

	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;
