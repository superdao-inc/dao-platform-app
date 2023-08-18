import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { useSwitch } from 'src/hooks';
import { ActionBlock as CommonActionBlock, CreatedDaoIcon } from 'src/components';

type DaoProfileActionBlockProps = {
	daoSlug: string;
	className?: string;
};

const ActionBlock = (props: DaoProfileActionBlockProps) => {
	const { daoSlug, className = '' } = props;

	const { push, query } = useRouter();
	const { t } = useTranslation();

	const [isCreatedBlockShown, { off: hideCreatedBlock }] = useSwitch(Boolean(query.isNew));

	const handleCreatedBlockHide = () => {
		hideCreatedBlock();
		push(`/${daoSlug}`, undefined, { shallow: true });
	};

	return (
		<CommonActionBlock
			className={cn('px-6 py-4 hover:cursor-pointer', className)}
			isOpen={isCreatedBlockShown}
			onClose={handleCreatedBlockHide}
			title={t('components.dao.daoCreated.hint.title')}
			subtitle={t('components.dao.daoCreated.hint.subtitle')}
			icon={<CreatedDaoIcon width={40} height={40} />}
			iconWithoutBackground
			data-testid="DaoPage__createdBanner"
		/>
	);
};

export default ActionBlock;
