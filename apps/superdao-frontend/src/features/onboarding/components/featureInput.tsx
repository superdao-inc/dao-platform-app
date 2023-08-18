import { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Input } from 'src/components';

type Props = {
	id: string;
	name: string;
	onSave: (id: string, name: string) => void;
};

export const NewFeatureInput = (props: Props) => {
	const { id, name, onSave } = props;
	const [value, setValue] = useState(name);

	return (
		<Wrapper key={id}>
			<Input value={value} onChange={(e) => setValue(e.target.value)} />
			<Button color="accentPrimary" size="md" label="Save" onClick={() => onSave(id, value)} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
	display: flex;
	gap: 8px;
`;
