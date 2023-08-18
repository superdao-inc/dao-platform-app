import React, { useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useDebounce } from 'src/hooks';
import { paginationOffsetGenerator, RepoParams } from '../namespace';
import { Input, PageLoader } from 'src/components';
import { SudoDaoListLoader } from 'src/features/sudo/daoList/components/loader';
import { useInfiniteAllUsersQuery } from 'src/gql/user.generated';

export const SudoUserList = () => {
	const [searchPattern, searchPatternChange] = React.useState('');
	const searchTrigger = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void =>
		searchPatternChange(value);

	const [unscrolled, setUnscrolled] = useState(true);
	const [fullyScrolled, setFullyScrolled] = useState(false);

	const {
		data,
		isLoading,
		hasNextPage = false,
		fetchNextPage
	} = useInfiniteAllUsersQuery(
		{ ...RepoParams.overview, search: useDebounce(searchPattern, 500) },
		{ keepPreviousData: true, getNextPageParam: paginationOffsetGenerator }
	);
	const { pages } = data || {};

	const users = useMemo(() => {
		if (!pages) {
			return [];
		}

		return pages?.map((page) => page.allUsers.items).flat();
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
					<h1 className="text-foregroundPrimary text-xl font-semibold">Users</h1>
					<Input onChange={searchTrigger} placeholder={'Search by user display name'} />
				</div>
			</div>

			<div className="mt-4 flex flex-col">
				<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
						<div className="overflow-hidden">
							<div className="grid grid-cols-4 gap-4">
								<div className="text-foregroundPrimary py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
									Id
								</div>
								<div className="text-foregroundPrimary px-3 py-3.5 text-left text-sm font-semibold">Display name</div>
								<div className="text-foregroundPrimary px-3 py-3.5 text-left text-sm font-semibold">Wallet address</div>
								<div className="text-foregroundPrimary py-3.5 pl-3 pr-4 text-right sm:pr-6">Action</div>
							</div>

							<InfiniteScroll
								dataLength={users.length}
								next={fetchNextPage}
								hasMore={hasNextPage}
								loader={<SudoDaoListLoader />}
								endMessage={<div className="text-foregroundPrimary mt-2 w-full text-center text-lg">No more users</div>}
								className="relative"
								height="calc(80vh - 130px)"
								onScroll={handleScroll}
							>
								{users.map((item) => (
									<div
										style={{ borderBottom: '1px solid white' }}
										className={'grid w-full grid-cols-4 gap-4'}
										key={item.id}
									>
										<div className="text-foregroundPrimary whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
											{item.id}
										</div>

										<div className="text-foregroundPrimary max-w-[250px] overflow-hidden overflow-ellipsis whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
											{item.displayName}
										</div>

										<div className="text-foregroundPrimary whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
											{item.walletAddress}
										</div>

										<div className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
											<a href={`/sudo/users/${item.id}`} className="text-accentPrimary hover:text-accentPrimaryHover">
												Edit<span className="sr-only">, {item.slug}</span>
											</a>
										</div>
									</div>
								))}
							</InfiniteScroll>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
