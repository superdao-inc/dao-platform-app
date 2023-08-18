import { Avatar } from 'src/components/common/avatar';
import { TooltipContent } from 'src/components/navigation/tooltipContent';
import Tooltip from 'src/components/tooltip';
import { UserDaoParticipationQuery } from 'src/gql/user.generated';

type Props = {
	dao: UserDaoParticipationQuery['daoParticipation']['items'][0]['dao'];
	isActive: boolean;
	onClick: () => void;
};

export const NavigationDaoAvatar = (props: Props) => {
	const { dao, isActive, onClick } = props;

	return (
		<Tooltip
			className="my-2 w-full first:mt-0 last:mb-0"
			content={<TooltipContent className="max-w-[280px]" description={dao.name} />}
			placement="right"
		>
			<div
				onClick={onClick}
				className={`relative flex h-10 w-full cursor-pointer items-center justify-center transition ${
					isActive ? '' : 'hover-firstChild:top-1/4 hover-firstChild:h-3/6'
				}`}
				data-testid={`LeftMenu__dao${dao.slug}`}
			>
				<div
					className={`bg-accentPrimary absolute left-0 w-[3px] rounded-r-lg transition-all ${
						isActive ? 'top-0 h-10' : 'top-2/4 h-0'
					}`}
				></div>
				<Avatar seed={dao.id} fileId={dao.avatar} size="md" />
			</div>
		</Tooltip>
	);
};
