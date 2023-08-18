import { useTranslation } from 'next-i18next';

import { Body, Cell, FacebookOutlineIcon, TwitterOutlineIcon } from 'src/components';
import { FacebookShareButton, TwitterShareButton } from 'src/components';

type Props = {
	daoName: string;
	targetNftUrl: string;
	fullUrl: string;
};

export const ShareSocialButtons = (props: Props) => {
	const { daoName, targetNftUrl, fullUrl } = props;

	const { t } = useTranslation();

	return (
		<>
			<TwitterShareButton className="w-full" title={t('sharing.twitter.mint', { daoName, targetNftUrl })} url={fullUrl}>
				<Cell
					className="hover:bg-backgroundTertiaryHover transition-all"
					size="sm"
					before={<TwitterOutlineIcon width={20} height={20} />}
					label={<Body className="mb-0">Twitter</Body>}
				/>
			</TwitterShareButton>
			<FacebookShareButton className="w-full" url={fullUrl}>
				<Cell
					className="hover:bg-backgroundTertiaryHover transition-all"
					size="sm"
					before={<FacebookOutlineIcon width={20} height={20} />}
					label={<Body className="mb-0">Facebook</Body>}
				/>
			</FacebookShareButton>
		</>
	);
};
