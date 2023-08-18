import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import { borders, colors } from 'src/style';
import { Body, EthereumIcon, Title2 } from 'src/components';

export const ContractInfo = () => {
	const { t } = useTranslation();

	return (
		<Wrapper>
			<IconWrapper>
				<EthereumIcon width={32} height={32} fill={colors.foregroundSecondary} />
			</IconWrapper>

			<Title2 className="mt-4" color={colors.foregroundPrimary}>
				{t('pages.createDao.contractStep.title')}
			</Title2>

			<Body className="mt-2" color={colors.foregroundSecondary}>
				{t('pages.createDao.contractStep.description')}
			</Body>
		</Wrapper>
	);
};

const Wrapper = styled.div`
	margin-top: -8px;
	padding: 20px;
	border-radius: ${borders.medium};
	background: ${colors.backgroundSecondary};
`;

const IconWrapper = styled.div`
	background-color: ${colors.backgroundTertiary};
	border-radius: ${borders.full};
	width: 56px;
	height: 56px;

	display: flex;
	justify-content: center;
	align-items: center;
`;
