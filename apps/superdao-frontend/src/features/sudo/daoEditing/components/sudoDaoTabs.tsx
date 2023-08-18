import cn from 'classnames';

const sudoDaoTabs = ['Edit Dao', 'Analytics'];

type Props = {
	currentTab: string;
	setCurrentTab: (tab: string) => void;
};

export const SudoDaoTabs = (props: Props) => {
	const { currentTab, setCurrentTab } = props;

	return (
		<div className="mb-4 sm:block">
			<div className="border-b border-gray-200">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					{sudoDaoTabs.map((tab) => (
						<a
							key={tab}
							onClick={() => setCurrentTab(tab)}
							className={cn(
								tab === currentTab
									? 'border-accentPrimary text-accentPrimary'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
								'cursor-pointer whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
							)}
						>
							{tab}
						</a>
					))}
				</nav>
			</div>
		</div>
	);
};
