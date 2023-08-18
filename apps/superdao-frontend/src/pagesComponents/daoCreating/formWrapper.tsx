import React, { HTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { SerializedStyles } from '@emotion/react';

type Props = HTMLAttributes<'div'> & {
	title: string;
	formCss?: SerializedStyles;
	onSubmit: () => void;
};

export const FormWrapper: React.FC<Props> = ({ title, onSubmit, formCss, children }) => {
	return (
		<Form onSubmit={onSubmit} css={formCss} data-testid={`DaoForm__${title}`}>
			<Heading>{title}</Heading>

			{children}
		</Form>
	);
};

const Heading = styled.header`
	font-weight: bold;
	font-size: 36px;
	line-height: 48px;
	color: #fff;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	align-items: flex-start;

	gap: 28px;
`;
