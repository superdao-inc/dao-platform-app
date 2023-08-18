import { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import { useRouter } from 'next/router';
import { DiscoveryIcon, MemberIcon, PlusIcon } from '../assets/icons';
import { RequestBetaAccessModal } from '../modals/requestBetaAccessModal';
import { colors } from 'src/style';
import { Label1, SubHeading } from 'src/components/text';
import { DaoLimitModal } from 'src/components/modals/daoLimitModal';
import { UserAPI } from 'src/features/user/API';
import { PATH_PROFILE_EDIT } from 'src/features/user/constants';

export const EditProfileItem = () => {
	const { t } = useTranslation();

	return (
		<Link href={PATH_PROFILE_EDIT} passHref>
			<ListItem>
				<IconWrapper>
					<MemberIcon width={24} height={24} />
				</IconWrapper>

				<ListItemContent>
					<Label1>{t('components.onboarding.profile.label1')}</Label1>
					<SubHeading color={colors.foregroundSecondary}>{t('components.onboarding.profile.label2')}</SubHeading>
				</ListItemContent>
			</ListItem>
		</Link>
	);
};

type Props = {
	hasBetaAccess: boolean;
};

export const CreateDaoItem = (props: Props) => {
	const { hasBetaAccess } = props;

	const [isRequestOpen, setIsRequestOpen] = useState(false);
	const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

	const { data: canCreateMoreData } = UserAPI.useCanCreateMoreDaoQuery();
	const { canCreateMoreDao } = canCreateMoreData!;

	const { push } = useRouter();
	const { t } = useTranslation();

	const handleClick = () => {
		if (!hasBetaAccess) {
			setIsRequestOpen(true);
			return;
		}

		if (canCreateMoreDao) {
			push('/daos/create');
		} else {
			setIsLimitModalOpen(true);
		}
	};

	return (
		<>
			<ListItem onClick={handleClick}>
				<IconWrapper>
					<PlusIcon width="24" height="24" />
				</IconWrapper>

				<ListItemContent>
					<Label1>{t('components.onboarding.dao.label1')}</Label1>
					<SubHeading color={colors.foregroundSecondary}>{t('components.onboarding.dao.label2')}</SubHeading>
				</ListItemContent>
			</ListItem>
			{!hasBetaAccess && <RequestBetaAccessModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />}
			{hasBetaAccess && <DaoLimitModal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} />}
		</>
	);
};

export const ExploreDaosItem = () => {
	const { t } = useTranslation();

	return (
		<Link href="/discovery" passHref>
			<ListItem>
				<IconWrapper>
					<DiscoveryIcon width={24} height={24} />
				</IconWrapper>

				<ListItemContent>
					<Label1>{t('components.onboarding.discovery.label1')}</Label1>
					<SubHeading color={colors.foregroundSecondary}>{t('components.onboarding.discovery.label2')}</SubHeading>
				</ListItemContent>
			</ListItem>
		</Link>
	);
};

const ListItem = styled.a`
	padding: 8px 12px;
	border-radius: 8px;
	width: 100%;

	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}
`;

const ListItemContent = styled.span`
	flex: 1;
`;

const IconWrapper = styled.div`
	width: 40px;
	height: 40px;

	display: flex;
	justify-content: center;
	align-items: center;

	border-radius: 50%;
	background-color: ${colors.overlayTertiary};
`;
