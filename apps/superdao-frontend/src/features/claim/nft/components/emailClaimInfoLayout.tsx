import Image from 'next/image';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { Body, Button, PageContent, Title1, AnimationWrapper } from 'src/components';

import confettiAnimationJson from 'src/components/assets/lottie/confetti.json';

type Props = {
	title: string;
	description: ReactNode;
	image: { src: string; width: number; height: number };
	btn?: [string, () => void];
	secondaryBtn?: [string, () => void];
	isLoading?: boolean;
};

export const alreadyUsedImage = { src: '/assets/arts/alreadyUsedLinkArt.svg', width: 200, height: 200 };
export const claimProcessImage = { src: '/assets/arts/claimProcessArt.svg', width: 228, height: 200 };
export const mascotSweatingImage = { src: '/assets/arts/mascotSweating.svg', width: 126, height: 171 };
export const mascotSadImage = { src: '/assets/arts/mascotSad.svg', width: 126, height: 171 };

const confettiAnimationConfig = {
	animationData: confettiAnimationJson,
	loop: true
};

export const EmailClaimInfoLayout = (props: Props) => {
	const {
		image,
		btn: [btnLabel, onClick] = [undefined, undefined],
		secondaryBtn: [secondaryBtnLabel, secondaryBtnOnClick] = [undefined, undefined],
		title,
		description,
		isLoading = false
	} = props;

	return (
		<PageContent>
			<div className="mx-auto flex h-full max-w-[470px] flex-col items-center justify-center">
				<div className="relative">
					<Image {...image} />
					{isLoading ? (
						<div className="absolute -top-4 -right-12 rotate-45">
							<AnimationWrapper config={confettiAnimationConfig} />
						</div>
					) : null}
				</div>
				<div className="mt-[25px] mb-[32px]">
					<Title1 className="mb-2 text-center">{isLoading ? <LoadingDots>{title}</LoadingDots> : title}</Title1>
					<Body className="text-foregroundSecondary text-center">{description}</Body>
				</div>
				<div className="flex">
					{secondaryBtnLabel && (
						<Button
							label={secondaryBtnLabel}
							onClick={secondaryBtnOnClick}
							color="transparent"
							size="lg"
							className="mr-8"
						/>
					)}
					{btnLabel && <Button label={btnLabel} onClick={onClick} color="overlayTertiary" size="lg" />}
				</div>
			</div>
		</PageContent>
	);
};

const LoadingDots = styled.div`
	&:after {
		content: ' .';
		animation: dots 1s steps(5, end) infinite;
		display: inline-block;
	}

	@keyframes dots {
		0%,
		20% {
			color: rgba(0, 0, 0, 0);
			text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
		}
		40% {
			color: white;
			text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
		}
		60% {
			text-shadow: 0.25em 0 0 white, 0.5em 0 0 rgba(0, 0, 0, 0);
		}
		80%,
		100% {
			text-shadow: 0.25em 0 0 white, 0.5em 0 0 white;
		}
	}
`;
