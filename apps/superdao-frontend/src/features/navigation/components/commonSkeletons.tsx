import { SkeletonComponent } from 'src/components/skeletonBaseComponent';

type Props = {
	count: number;
};

export const CommonSkeletons = (props: Props) => {
	const { count } = props;

	return (
		<>
			{[...Array(count)].map((_, index) => (
				<SkeletonComponent
					key={`dao_skeleton_${index}`}
					variant="circular"
					className="mx-auto my-4 h-10 w-10 touch-none first:mt-0 last:mb-0"
				/>
			))}
		</>
	);
};
