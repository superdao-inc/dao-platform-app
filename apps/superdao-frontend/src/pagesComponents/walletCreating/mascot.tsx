import ReactDOM from 'react-dom';
import confetti from 'canvas-confetti';
import { MascotClapperboardArt } from 'src/components/assets/mascot/mascotWithClapperboard';
import { walletCreationSteps } from './constants';

export const Mascot = ({ step }: { step: number }) => {
	return (
		<>
			<ConfettiCanvas step={step} />
			<div className="mx-auto">
				<MascotClapperboardArt />
			</div>
		</>
	);
};

const defaults = {
	angle: 35,
	spread: 30,
	zIndex: 3,
	particleCount: 30,
	colors: ['##5EDC10', '#DF7FFF', '#FFBF24', '#398FE5']
};

export const ConfettiCanvas = ({ step }: { step: number }) => {
	const confettiRef = (node: any) => {
		if (!node) {
			return;
		}

		const myConfetti = confetti.create(node, {
			resize: true,
			useWorker: true
		});

		step === walletCreationSteps.finishing && myConfetti({ ...defaults, origin: { y: 0.33, x: 0.51 } });
	};

	if (typeof document === 'undefined') {
		return null;
	}

	return ReactDOM.createPortal(
		<canvas
			ref={confettiRef}
			style={{
				width: '100vw',
				height: '100vh',
				position: 'absolute',
				top: 0,
				left: 0,
				zIndex: 2,
				pointerEvents: 'none'
			}}
		/>,
		document.body
	);
};
