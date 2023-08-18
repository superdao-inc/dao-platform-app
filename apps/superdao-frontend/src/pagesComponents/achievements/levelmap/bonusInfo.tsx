import { FC } from 'react';
import cn from 'classnames';

import { Title2, SubHeading, Label3, Caption, DoneIcon } from 'src/components';

import { colors } from 'src/style';

type Props = {
	title: string;
	description: string;
	image: string;
	isCompleted: boolean;
	isMobile?: boolean;
};

export const BonusInfo: FC<Props> = ({ title, description, image, isCompleted, isMobile = false }) => {
	return (
		<div className="bg-backgroundPrimary flex w-full flex-row justify-between rounded-lg py-4 px-6">
			<div className={cn('my-auto flex  flex-col ', { 'mr-[20px]': isMobile })}>
				{isMobile ? (
					<>
						<Label3 className="tracking-[-0.08px]">
							{isCompleted && <span className="text-accentPrimary mr-1">✓</span>}
							{title}
						</Label3>
						<Caption className="text-foregroundSecondary tracking-[-0.08px]">{description}</Caption>
					</>
				) : (
					<>
						<div className="flex flex-row items-center">
							{isCompleted && <DoneIcon fill={colors.accentPrimary} className="mr-1" />}
							<Title2>{title}</Title2>
						</div>
						<SubHeading className="text-foregroundSecondary">{description}</SubHeading>
					</>
				)}
			</div>
			<div
				className={cn(
					{ 'opacity-40': isCompleted },
					isMobile ? 'flex h-[63px] w-[88px] justify-center' : 'max-h-[115px] max-w-[152px]'
				)}
			>
				<img
					className={cn(
						{ 'opacity-40': isCompleted },
						isMobile ? ' max-h-[63px] max-w-[88px] ' : 'max-h-[115px] max-w-[152px]'
					)}
					src={image}
				/>
			</div>
		</div>
	);
};
