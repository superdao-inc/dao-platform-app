import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import cn from 'classnames';

import { VerifyIcon } from 'src/components/assets/icons';
import { Avatar } from 'src/components/common/avatar';
import { EmptyImage } from 'src/components/common/emptyImage';
import { Caption, Title3 } from 'src/components/text';
import { ArtworkView } from 'src/components/artwork';
import { Loader } from '../common/loader';

type Tier = {
	isDeactivated: boolean;
	artworks: {
		id: string | null;
		image: string | null;
		animationUrl: string | null;
	}[];
};

type Props = {
	daoId: string;
	name: string;
	description: string;
	membersCount: number;
	isDaoVerified: boolean;
	avatar: string | null;
	tiers: Tier[] | undefined;
	isCollectionLoading: boolean;
	isDaoVerificationLoading: boolean;
	isPopup?: boolean;
	className?: string;
};

const MAX_DISPLAY_ARTWORKS_COUNT = 3;

export const DaoPreviewCardComponent = (props: Props) => {
	const {
		daoId,
		name,
		description,
		membersCount,
		isDaoVerified,
		avatar,
		tiers,
		isCollectionLoading,
		isDaoVerificationLoading,
		isPopup,
		className
	} = props;

	const { t } = useTranslation();

	//TODO: check if it can be updated with new avatars
	const ImageAvatar = <Avatar className="mx-auto mt-1 w-max lg:mx-0 lg:mt-0" seed={daoId} fileId={avatar} size="lg" />;

	const { slicedTiers, emptyArtworks } = useMemo(() => {
		if (!tiers?.length) return { slicedTiers: [], emptyArtworks: new Array(MAX_DISPLAY_ARTWORKS_COUNT).fill(true) };

		const slicedTiers = tiers.length >= MAX_DISPLAY_ARTWORKS_COUNT ? tiers.slice(0, MAX_DISPLAY_ARTWORKS_COUNT) : tiers;

		const emptyArtworksCount = MAX_DISPLAY_ARTWORKS_COUNT - slicedTiers.length;

		return { slicedTiers, emptyArtworks: new Array(emptyArtworksCount).fill(true) };
	}, [tiers]);

	const content = isCollectionLoading ? (
		<div className="mt-4 hidden w-full gap-[9px] lg:flex">
			<div className="bg-overlayTertiary h-[59px] w-[59px] animate-pulse rounded-lg"></div>
			<div className="bg-overlayTertiary h-[59px] w-[59px] animate-pulse rounded-lg"></div>
			<div className="bg-overlayTertiary h-[59px] w-[59px] animate-pulse rounded-lg"></div>
		</div>
	) : (
		<div className="mt-4 hidden w-full gap-[9px] lg:flex">
			{slicedTiers.map((tier, index) => (
				<ArtworkView
					className="first-child:object-cover h-[59px] w-[59px] rounded-lg"
					artworks={tier.artworks}
					//TODO: create normal styled controls for videos
					playOnHover={false}
					showCustomControls={false}
					key={`artwork${tier?.artworks[0]?.image}Tier${index}`}
				/>
			))}
			{emptyArtworks.map((_, index) => (
				<EmptyImage key={index} className="h-[59px] w-[59px] rounded-lg" imgSize={16} />
			))}
		</div>
	);

	const verificationContent = isDaoVerified && <VerifyIcon className="shrink-0" />;

	return (
		<div
			className={cn(
				'bg-backgroundSecondary hover:bg-backgroundTertiary min-w-[138px] cursor-pointer rounded-xl px-3 py-4 transition-all lg:max-w-[243px] lg:px-6 lg:py-6',
				{ 'shadow-[0_0_24px_rgba(0,0,0,0.2)]': isPopup },
				className
			)}
		>
			{ImageAvatar}
			<div className="mx-auto mt-3 flex w-max max-w-full items-center gap-2 truncate lg:mx-0">
				<Title3 className="truncate">{name}</Title3>
				{isDaoVerificationLoading ? <Loader className="shrink-0" size="sm" /> : verificationContent}
			</div>
			<Caption className="text-foregroundTertiary mx-auto w-max max-w-full truncate lg:mx-0">
				{t('components.daoList.members', { count: membersCount })}
			</Caption>
			<div className="mt-2 hidden lg:block">
				<Caption className="text-foregroundSecondary line-clamp-3 min-h-[54px]">{description}</Caption>
			</div>
			{content}
		</div>
	);
};
