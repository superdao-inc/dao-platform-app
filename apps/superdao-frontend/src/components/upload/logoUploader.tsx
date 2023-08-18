import { useEffect, useMemo } from 'react';

import styled from '@emotion/styled';
import { Avatar, UserAvatar } from 'src/components/common/avatar';
import { Title3 } from 'src/components/text';
import { useUploadWidget } from 'src/hooks';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { colors } from 'src/style';

type Props = {
	label: string;
	seed: string;
	currentAvatar?: string | null;
	isUserProfile?: boolean;
	onChange: (file: string) => void;
};

export const LogoUploader = ({ label, seed, currentAvatar, isUserProfile, onChange }: Props) => {
	const AvatarComponent = isUserProfile ? UserAvatar : Avatar;
	const [files, uploadWidget] = useUploadWidget({ imagesOnly: true, crop: '1:1' });
	const lastUploadedAvatar = files.at(-1);

	useEffect(() => {
		if (lastUploadedAvatar) {
			onChange(lastUploadedAvatar);
		}
	}, [lastUploadedAvatar, onChange]);

	const avatarUrl = useMemo(() => {
		if (lastUploadedAvatar) {
			return getOptimizedFileUrl(lastUploadedAvatar);
		}

		return currentAvatar ? getOptimizedFileUrl(currentAvatar) : undefined;
	}, [lastUploadedAvatar, currentAvatar]);

	return (
		<Wrapper data-testid="DaoForm__logoUploader">
			<AvatarComponent seed={seed} src={avatarUrl} size="56" onClick={uploadWidget.open} />
			<Label onClick={uploadWidget.open}>{label}</Label>
			{uploadWidget.render()}
		</Wrapper>
	);
};

const Wrapper = styled.div`
	display: flex;
	gap: 24px;
	align-items: center;
`;

const Label = styled(Title3)`
	color: ${colors.accentPrimary};
	cursor: pointer;
`;
