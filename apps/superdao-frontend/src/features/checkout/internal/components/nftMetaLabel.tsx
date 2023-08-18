import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { colors } from 'src/style';
import { Caption, Label3 } from 'src/components';

type NftMetaLabelProps = {
	icon: ReactElement | null;
	text: string;
	subText?: string;
};

const NftMetaLabel = (props: NftMetaLabelProps) => {
	const { icon, text, subText } = props;

	return (
		<Label>
			<div>{icon}</div>

			<Label3 className="text-foregroundPrimary">{text}</Label3>
			{subText && <Caption className="text-foregroundSecondary">{subText}</Caption>}
		</Label>
	);
};

const Label = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 28px;

	padding: 8px;
	background-color: ${colors.overlaySecondary};
	border-radius: 8px;

	& > span {
		margin-left: 8px;
	}
`;

type NftMetaLabelsProps = {
	className?: string;
	labels: NftMetaLabelProps[];
};

export const NftMetaLabels = (props: NftMetaLabelsProps) => {
	const { className, labels } = props;

	return (
		<div className={`flex flex-wrap gap-2 ${className}`}>
			{labels.map((data) => (
				<NftMetaLabel {...data} key={data.text} />
			))}
		</div>
	);
};
