import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import styled from '@emotion/styled';

import { DaoWhitelistJoin } from './DaoWhitelistJoin';
import { borders, colors } from 'src/style';

import { Body, Title1 } from 'src/components';

type Props = {
	whitelistUrl: string | null;
	isAuthorized?: boolean;
};

export const DaoMemberZone = (props: Props) => {
	const { isAuthorized, whitelistUrl } = props;

	const { t } = useTranslation();

	return (
		<Wrapper
			data-testid={'DaoMembersBanner__block'}
			className="flex w-full flex-col items-center p-6 pb-10 lg:px-[100px] lg:py-12"
		>
			<Image src={'/assets/arts/communityArt.svg'} priority={true} alt={'Community art'} width={246} height={200} />

			<Title1 className="mt-4">{t('components.dao.membersBanner.title')}</Title1>
			<Body className="mt-2 max-w-[200px] text-center md:max-w-max">
				{t('components.dao.membersBanner.description')}
			</Body>

			{whitelistUrl && whitelistUrl.length && (
				<DaoWhitelistJoin
					className="mt-8"
					btnLabel={isAuthorized ? t('components.dao.membersBanner.join') : t('actions.labels.login')}
					whitelistUrl={whitelistUrl}
				/>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
	background: ${colors.backgroundSecondary};
	border-radius: ${borders.medium};
`;
