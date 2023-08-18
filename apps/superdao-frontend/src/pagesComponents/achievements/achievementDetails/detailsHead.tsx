import upperFirst from 'lodash/upperFirst';
import { useTranslation } from 'next-i18next';
import { Label2, SubHeading, Title2 } from 'src/components';
import Tooltip from 'src/components/tooltip';
import { UserDetail, UserDetailProps } from 'src/pagesComponents/nft/details/userDetail';
import { colors } from 'src/style';
import { OpenseaLink } from './openseaLink';

type Props = {
	collectionName?: string;
	tierName?: string | null;
	owner?: UserDetailProps;
	openseaUrl: string | null;
	isMobile: boolean;
};

const tierNameMaxLength = 14;

export const DetailsHead = ({ collectionName = '', tierName = '', owner, openseaUrl, isMobile }: Props) => {
	const { t } = useTranslation();
	return (
		<div>
			{collectionName && (
				<div className="flex items-center gap-2 sm:mb-4 sm:justify-between">
					<div className="line-clamp-2" data-testid="NftCard__collectionName">
						{isMobile ? (
							<SubHeading color={colors.foregroundSecondary}>{upperFirst(collectionName)}</SubHeading>
						) : (
							<Label2>{upperFirst(collectionName)}</Label2>
						)}
					</div>
					{openseaUrl && (
						<OpenseaLink
							className="!h-[20px] !w-[20px] justify-center !p-0 sm:!h-[24px] sm:!w-[24px]"
							svgHeight={isMobile ? 12 : 16}
							svgWeight={isMobile ? 12 : 16}
							openseaUrl={openseaUrl}
						/>
					)}
				</div>
			)}
			{tierName && (
				<>
					{/* Нужно, чтобы не показывать тултип для коротких названий */}
					{tierName?.length > tierNameMaxLength ? (
						<Tooltip placement="bottom" content={upperFirst(tierName)}>
							<Title2 className="mb-2 truncate">{upperFirst(tierName)}</Title2>
						</Tooltip>
					) : (
						<Title2 className="truncate sm:mb-2" data-testid="NftCard__TierName">
							{upperFirst(tierName)}
						</Title2>
					)}
				</>
			)}

			{owner && owner.name && (
				<div className="mt-6 sm:mt-[50px]">
					<UserDetail {...owner} isMobile={isMobile} subhead={t('pages.nft.details.owner')} />
				</div>
			)}
		</div>
	);
};
