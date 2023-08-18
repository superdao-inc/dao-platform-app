import { isAddress } from 'ethers/lib/utils';
import Link from 'next/link';
import React, { FC, HTMLAttributes, useMemo } from 'react';
import { css } from '@emotion/react';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { Body, Label1, SubHeading, UserAvatar } from 'src/components';
import Tooltip from 'src/components/tooltip';
import { DisabledRowWrapper } from 'src/components/disabledRowWrapper';
import { GetChoicesQuery, GetVotesQuery } from 'src/gql/proposal.generated';
import { shrinkWallet } from '@sd/superdao-shared';

type Props = {
	voter: GetVotesQuery['getVotes'][number]['user'];
	choices: GetChoicesQuery['getChoices'];
	choiceId: string;
	isCurrentUser: boolean;
	daoSlug: string;
};

const normalizeName = (address: string | null) => {
	if (!address) return null;
	return isAddress(address) ? shrinkWallet(address) : address;
};

export const VoteDisplay: FC<HTMLAttributes<HTMLDivElement> & Props> = ({
	choiceId,
	choices,
	voter,
	className,
	isCurrentUser,
	daoSlug
}) => {
	const choice = choices.filter((choice) => choice.id === choiceId)[0]?.name;
	const { isClaimed, slug, avatar } = voter;
	const TooltipComponent = isClaimed
		? React.Fragment
		: (prop: any) => <Tooltip {...prop} content={<SubHeading>Unclaimed</SubHeading>} placement="bottom" followMouse />;

	const linkPath = isCurrentUser ? `/users/${slug || voter.id}` : `/${daoSlug}/members/${slug || voter.id}`;

	const LinkComponent = isClaimed ? (prop: any) => <Link {...prop} href={linkPath} passHref /> : React.Fragment;

	const avatarImage = useMemo(() => {
		if (isClaimed) {
			return avatar ? getOptimizedFileUrl(avatar) : undefined;
		}
		return '/assets/unclaimed.png';
	}, [isClaimed, avatar]);
	return (
		<DisabledRowWrapper isDisabled={isClaimed} className="lg:pl-3 lg:pr-3">
			<LinkComponent>
				<div
					className={`flex w-full flex-col justify-between gap-1 lg:flex-row lg:items-center lg:gap-6 ${className}`}
					data-testid={`VoteDisplay__${
						normalizeName(voter.displayName) || normalizeName(voter.ens) || shrinkWallet(voter.walletAddress)
					}`}
				>
					<TooltipComponent>
						<div className="mr-4 flex items-center gap-4" data-testid={'VoteDisplay__author'}>
							<UserAvatar
								className="absolute top-5 lg:static"
								size="xs"
								seed={voter.id}
								src={avatarImage}
								data-testid={'VoteDisplay__authorAvatar'}
							/>
							<Label1 className="max-w-[200px] truncate pl-11 lg:p-0" data-testid={'VoteDisplay__authorName'}>
								{normalizeName(voter.displayName) || normalizeName(voter.ens) || shrinkWallet(voter.walletAddress)}
							</Label1>
						</div>
					</TooltipComponent>
					<Tooltip
						content={
							<SubHeading className="max-w-[300px]">
								<span
									css={css({
										whiteSpace: 'break-spaces',
										wordBreak: 'break-word'
									})}
								>
									{choice}
								</span>
							</SubHeading>
						}
						placement="bottom"
					>
						<Body
							className="text-foregroundSecondary max-w-[420px] truncate pl-11 lg:pl-0"
							data-testid={'VoteDisplay__authorChoice'}
						>
							{choice}
						</Body>
					</Tooltip>
				</div>
			</LinkComponent>
		</DisabledRowWrapper>
	);
};
