import { Button } from 'src/components/button';
import { openExternal } from 'src/utils/urls';
import { useIsAuthorized } from 'src/features/auth/hooks/useIsAuthorized';

type Props = {
	className?: string;
	btnLabel: string;
	whitelistUrl: string;
};

export const DaoWhitelistJoin = (props: Props) => {
	const { className, btnLabel, whitelistUrl } = props;

	const isAuthorized = useIsAuthorized();

	const openWhitelistUrl = () => {
		openExternal(whitelistUrl);
	};

	const handleJoinDao = () => {
		if (isAuthorized) {
			openWhitelistUrl();
			return;
		}
	};

	return (
		<>
			<Button className={className} color="accentPrimary" size="lg" label={btnLabel} onClick={handleJoinDao} />
		</>
	);
};
