import cn from 'classnames';
import { useRouter } from 'next/router';
import { Avatar, Caption, Label1 } from 'src/components';

export type UserDetailProps = {
	name: string;
	id: string;
	slug: string | undefined;
	avatar: string | null | undefined;
};

type Props = {
	subhead?: string;
	className?: string;
	isMobile?: boolean;
} & UserDetailProps;

export const UserDetail = ({ className, name, id, slug, avatar, subhead, isMobile }: Props) => {
	const { push } = useRouter();

	const handleOpenDao = () => slug && push(`/${slug}`);

	return (
		<div className={cn('flex cursor-pointer items-center justify-start', className)} onClick={handleOpenDao}>
			<Avatar size="sm" fileId={avatar} seed={id} />
			<div className="ml-3 w-[calc(100%-44px)]" data-testid="NftCard__creator">
				<Label1 className={cn('text-foregroundPrimary mb-0.5 truncate', { 'max-w-[260px]': isMobile })}>{name}</Label1>
				<Caption className="text-foregroundSecondary">{subhead}</Caption>
			</div>
		</div>
	);
};
