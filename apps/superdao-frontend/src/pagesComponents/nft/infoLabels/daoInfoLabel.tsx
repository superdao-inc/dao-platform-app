import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Avatar, Body, Label1 } from 'src/components';
import { colors } from 'src/style';
import { InfoLabel } from './infoLabel';

export type DaoInfoLabelProps = {
	name: string;
	id: string;
	slug: string | undefined;
	avatar: string | null | undefined;
};

/**
 * @deprecated
 */
export const DaoInfoLabel = (props: DaoInfoLabelProps) => {
	const { name, slug, id, avatar } = props;

	const { t } = useTranslation();
	const { push } = useRouter();

	const handleOpenDao = () => slug && push(`/${slug}`);

	return (
		<InfoLabel onClick={handleOpenDao}>
			<Avatar size="xxs" fileId={avatar} seed={id} />
			<Label1 className="w-full max-w-[200px] truncate">{name}</Label1>
			<Body color={colors.foregroundSecondary}>{t('pages.nft.details.creator')}</Body>
		</InfoLabel>
	);
};
