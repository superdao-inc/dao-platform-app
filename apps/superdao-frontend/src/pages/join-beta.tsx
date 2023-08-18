import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { useCallback } from 'react';
import { prefetchData, SSR } from 'src/client/ssr';
import { Button, Title1, Body } from 'src/components';
import { colors } from 'src/style';
import { UserAPI } from 'src/features/user/API';
import { CustomHead } from 'src/components/head';
import { AuthUI } from 'src/features/auth';

type Props = {
	// NOTE: this is used instead of useIsAuthorized so that there is no status blinking after login
	isAuthorized: boolean;
};

const JoinBeta: NextPage<Props> = (props) => {
	const { isAuthorized } = props;

	const { t } = useTranslation();
	const { push } = useRouter();
	const { openAuthModal } = AuthUI.useAuthModal();
	const { mutate } = UserAPI.useJoinBetaMutation({
		onSuccess: () => push('/daos?welcomeToBeta=1')
	});

	const handleJoinBeta = useCallback(() => mutate({}), [mutate]);

	const handleOpenModal = useCallback(
		() => openAuthModal({ onSuccess: handleJoinBeta }),
		[handleJoinBeta, openAuthModal]
	);

	return (
		<Wrapper>
			<CustomHead main={'Beta'} additional={'Superdao'} description={'Join Superdao beta'} />

			<Logo width={36} height={36} src="/logo.svg" />

			{isAuthorized ? (
				<>
					<img className="mb-2" src="/assets/joinBeta.svg" width={200} height={200} />

					<Title1 className="mb-2">{t('pages.joinBeta.authorized.title')}</Title1>
					<Body className="mb-8" color={colors.foregroundSecondary}>
						{t('pages.joinBeta.authorized.description')}
					</Body>

					<Button
						size="lg"
						color="accentPrimary"
						label={t('pages.joinBeta.authorized.button')}
						onClick={handleJoinBeta}
					/>
				</>
			) : (
				<>
					<img className="mb-2" src="/assets/joinBetaNew.svg" width={200} height={200} />

					<Title1 className="mb-2">{t('pages.joinBeta.unauthorized.title')}</Title1>
					<Body className="mb-8" color={colors.foregroundSecondary}>
						{t('pages.joinBeta.unauthorized.description')}
					</Body>

					<Button
						size="lg"
						color="accentPrimary"
						label={t('pages.joinBeta.unauthorized.button')}
						onClick={handleOpenModal}
					/>
				</>
			)}
		</Wrapper>
	);
};

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps, isAuthorized] = await prefetchData(ctx);

	return { props: { ...getProps(), isAuthorized } };
});

export default JoinBeta;

const Wrapper = styled.div`
	position: relative;

	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	padding: 0 10px;

	color: white;
`;

const Logo = styled.img`
	position: absolute;
	top: 16px;
	left: 14px;
`;
