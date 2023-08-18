import React, { useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Link from 'next/link';
import { useInfiniteAllDaosQuery } from 'src/gql/daos.generated';
import { useDebounce } from 'src/hooks';
import { paginationOffsetGenerator, RepoParams } from '../namespace';
import { Input, PageLoader } from 'src/components';
import { SudoDaoListLoader } from 'src/features/sudo/daoList/components/loader';
import { SudoDaosFilter } from 'src/features/sudo/daoList/components/sudoDaosFilter';
import { AllDaosFilter } from 'src/types/types.generated';
import * as Types from 'src/types/types.generated';

export const SudoDaoList = () => {
	const [searchPattern, searchPatternChange] = React.useState('');
	const searchTrigger = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void =>
		searchPatternChange(value);

	const [unscrolled, setUnscrolled] = useState(true);
	const [fullyScrolled, setFullyScrolled] = useState(false);
	const [filterValues, setFilterValues] = useState<Types.InputMaybe<AllDaosFilter>>(null);

	const {
		data,
		isLoading,
		hasNextPage = false,
		fetchNextPage
	} = useInfiniteAllDaosQuery(
		{ ...RepoParams.overview, search: useDebounce(searchPattern, 500), filter: filterValues },
		{ keepPreviousData: true, getNextPageParam: paginationOffsetGenerator }
	);
	const { pages } = data || {};

	const daos = useMemo(() => {
		if (!pages) {
			return [];
		}

		return pages?.map((page) => page.allDaos.items).flat();
	}, [pages]);

	if (!data?.pages) return null;
	if (isLoading) return <PageLoader />;

	const handleScroll = (e: MouseEvent) => {
		const notScrolled = !(e.target as any).scrollTop;
		const isFullyScrolled =
			(e.target as any).scrollTop + (e.target as any).clientHeight >= (e.target as any).scrollHeight;

		if (isFullyScrolled !== fullyScrolled) setFullyScrolled(isFullyScrolled);
		if (notScrolled !== unscrolled) setUnscrolled(notScrolled);
	};

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8">
			<div className="top-[64px] w-[calc(100%-144px)] bg-[#1b202a] sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<h1 className="text-foregroundPrimary mb-4 text-xl font-semibold">DAOs</h1>

					<Input onChange={searchTrigger} placeholder={'Enter dao name'} />
				</div>
			</div>

			<div className="mt-4 flex gap-6">
				<div className="mt-4 flex flex-col">
					<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
							<div className="overflow-hidden">
								<div className="grid grid-cols-4 gap-4">
									<div className="text-foregroundPrimary py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
										Slug
									</div>
									<div className="text-foregroundPrimary px-3 py-3.5 text-left text-sm font-semibold">Name</div>
									<div className="text-foregroundPrimary px-3 py-3.5 text-left text-sm font-semibold">
										Contract address
									</div>
									<div className="text-foregroundPrimary py-3.5 pl-3 pr-4 text-right sm:pr-6">Action</div>
								</div>

								<InfiniteScroll
									dataLength={daos.length}
									next={fetchNextPage}
									hasMore={hasNextPage}
									loader={<SudoDaoListLoader />}
									endMessage={
										<div className="text-foregroundPrimary mt-2 w-full text-center text-lg">No more daos</div>
									}
									className="relative"
									height="calc(80vh - 130px)"
									onScroll={handleScroll}
								>
									{daos.map((item) => (
										<div
											style={{ borderBottom: '1px solid white' }}
											className={'grid w-full grid-cols-4 gap-4'}
											key={item.id}
										>
											<div className="text-foregroundPrimary whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
												<Link href={`/${item.slug}`} passHref>
													<a target="_blank" className="text-accentPrimary hover:text-accentPrimaryHover">
														{item.slug}
													</a>
												</Link>
											</div>

											<div className="text-foregroundPrimary max-w-[250px] overflow-hidden overflow-ellipsis whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
												{item.name}
											</div>

											<div className="text-foregroundPrimary whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
												{item.contractAddress}
											</div>

											<div className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
												<Link href={`/sudo/daos/${item.slug}`}>
													<a className="text-accentPrimary hover:text-accentPrimaryHover">
														Edit<span className="sr-only">, {item.slug}</span>
													</a>
												</Link>
											</div>
										</div>
									))}
								</InfiniteScroll>
							</div>
						</div>
					</div>
				</div>

				<SudoDaosFilter onSubmit={setFilterValues} />
			</div>
		</div>
	);
};
