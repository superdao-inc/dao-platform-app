import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import {
	Dispatch,
	forwardRef,
	ReactNode,
	SetStateAction,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState
} from 'react';
import { Button } from 'src/components';
import { Artworks, ArtworksProps } from './artworks';
import { Owners, OwnersProps } from './owners';
import { DetailsTab, DetailsTabProps } from './tierInfoTabs/detailsTab';
import { OverviewTab, OverviewTabProps } from './tierInfoTabs/overviewTab';
import { PropertiesTab } from './tierInfoTabs/propertiesTab';

type TabType = {
	name: string;
	component: ReactNode;
};

type Props = {
	overviewData: OverviewTabProps;
	propertiesData?: any;
	ownersData?: OwnersProps;
	detailsData: DetailsTabProps;
	artworksData?: ArtworksProps;
	isShowArtworks?: boolean;
};

export type TabsRefProps = {
	tabs: TabType[];
	setActiveTab: Dispatch<SetStateAction<TabType | undefined>>;
	node: HTMLDivElement | null;
};

export const TierInfo = forwardRef<TabsRefProps, Props>(
	({ overviewData, propertiesData, ownersData, detailsData, artworksData, isShowArtworks }, ref) => {
		const divRef = useRef<HTMLDivElement>(null);
		const { t } = useTranslation();
		const [activeTab, setActiveTab] = useState<TabType>();

		const tabs = useMemo(() => {
			const arr = [];

			//если есть overview инфа
			if (overviewData.description.length > 0) {
				arr.push({
					name: t('components.nftDetailsTab.overview.title'),
					component: <OverviewTab {...overviewData} />
				});
			}

			//если тир рандом, то показываем таб с артворками
			if (isShowArtworks && artworksData) {
				arr.push({
					name: t('components.nftDetailsTab.artworks.title'),
					component: <Artworks {...artworksData} />
				});
			}

			if (ownersData?.owners.length) {
				arr.push({
					name: t('components.nftDetailsTab.owners.title'),
					component: <Owners {...ownersData} />
				});
			}

			//если есть properties информация
			if (propertiesData) {
				arr.push({
					name: t('components.nftDetailsTab.properties.title'),
					component: <PropertiesTab />
				});
			}

			//Details есть всегда
			arr.push({
				name: t('components.nftDetailsTab.details.title'),
				component: <DetailsTab {...detailsData} />
			});

			return arr;
		}, [artworksData, detailsData, isShowArtworks, overviewData, ownersData, propertiesData, t]);

		//ставим первый таб активным
		useEffect(() => {
			setActiveTab(tabs[0]);
		}, [tabs]);

		useImperativeHandle(ref, () => ({
			node: divRef?.current,
			tabs,
			setActiveTab
		}));

		return (
			<div ref={divRef} className="sm:bg-backgroundSecondary mt-5 w-full rounded-lg bg-transparent pb-0 sm:pb-6">
				<div
					className="mb-5 flex overflow-x-auto sm:mb-6 sm:overflow-x-hidden sm:p-6 sm:pb-0"
					data-testid="NftCard__tabs"
				>
					{tabs.map((tab) => (
						<Button
							className="mr-3 whitespace-nowrap rounded-full"
							key={tab.name}
							label={tab.name}
							color={tab.name === activeTab?.name ? 'accentPrimary' : 'overlayTertiary'}
							size="md"
							onClick={() => setActiveTab(tab)}
						/>
					))}
				</div>
				{/* такое условие потому что для овнеров свои стили, из-за особенностей дизайна */}
				<div
					className={cn(
						activeTab?.name !== 'Owners' &&
							'bg-backgroundSecondary rounded-lg py-5 px-4 sm:rounded-none sm:bg-transparent sm:py-0 sm:px-6'
					)}
				>
					{activeTab?.component}
				</div>
			</div>
		);
	}
);

TierInfo.displayName = 'TierInfo';
