import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';

import { DaoPreviewCard } from 'src/components/daoPreviewCard';
import { MENTION_SYMBOL } from 'src/constants/bio';
import { useDaoPreviewByIdQuery } from 'src/gql/daos.generated';
import { useSwitch } from 'src/hooks';

import { DaoBioMentionComponent } from './daoBioMentionComponent';

type Props = {
	daoId: string;
} & HTMLAttributes<HTMLSpanElement>;

export const DaoBioMentionContainer = (props: Props) => {
	const { daoId, className } = props;

	const { push } = useRouter();

	const [isPopupMounted, { on: showPopup, off: hidePopup }] = useSwitch(false);

	// must be loaded in SSR for better UX
	const { data: daoData } = useDaoPreviewByIdQuery({ id: daoId }, { enabled: !!daoId });
	const { daoById } = daoData || {};

	if (!daoById) return <>{`${MENTION_SYMBOL}${daoId}`}</>;

	const redirectToDao = () => push(`/${daoById.slug}`);

	const popup = <DaoPreviewCard className="max-w-[250px]" isPopup daoId={daoId} daoAddress={daoById.contractAddress} />;

	return (
		<DaoBioMentionComponent
			daoId={daoId}
			name={daoById.name}
			avatar={daoById.avatar}
			isPopupMounted={isPopupMounted}
			popup={popup}
			onClick={redirectToDao}
			onMouseEnter={showPopup}
			onMouseLeave={hidePopup}
			className={className}
		/>
	);
};
