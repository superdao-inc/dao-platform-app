import { FC } from 'react';
import cn from 'classnames';
import { DoneIcon } from 'src/components';
import { MobileDoneIcon } from 'src/components/assets/icons/mobileDone';

type Props = {
	isMobile?: boolean;
};

export const DoneCircle: FC<Props> = ({ isMobile = false }) => {
	return (
		<div
			className={cn('bg-foregroundTertiary border-foregroundQuaternary  w-fit  rounded-full border-4 p-0.5', {
				'h-[32px]  w-[32px]': isMobile
			})}
		>
			{isMobile ? <MobileDoneIcon /> : <DoneIcon />}
		</div>
	);
};
