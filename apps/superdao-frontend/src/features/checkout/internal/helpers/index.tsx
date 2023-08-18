import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

export const withRedirect = (
	Modal: ({ onRedirect }: { onRedirect: () => void }) => EmotionJSX.Element,
	handleRedirect: () => void
) => {
	const Redirect = () => <Modal onRedirect={handleRedirect} />;
	return Redirect;
};

export const withContinue = (
	Modal: ({ onRedirect, onContinue }: { onRedirect: () => void; onContinue: () => void }) => EmotionJSX.Element,
	handleContinue: () => void
) => {
	const Continue = ({ onRedirect }: { onRedirect: () => void }) => (
		<Modal onRedirect={onRedirect} onContinue={handleContinue} />
	);

	return Continue;
};
