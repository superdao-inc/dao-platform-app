import noop from 'lodash/noop';
import { memo, useContext } from 'react';
import { Modal } from 'src/components/baseModal';

import { SharedAuthentication } from '../../containers/sharedAuthentication';
import { AuthModalContext } from '../../context/authModalContext';

const MODAL_STYLES = {
	content: {
		minWidth: 'min(400px, 100%)',
		width: 'min(400px, 100%)',
		maxWidth: 'min(400px, 100%)',
		padding: 24,
		paddingTop: 20
	}
};

const AuthModal = () => {
	const { authModalIsShown, openAuthModalOptions } = useContext(AuthModalContext);
	const { onClose, onSuccess } = openAuthModalOptions;

	return (
		<Modal style={MODAL_STYLES} isOpen={authModalIsShown} withCloseIcon={!!onClose} onClose={onClose ?? noop}>
			<div className="relative my-auto min-h-[200px] w-full overflow-hidden rounded-xl p-0">
				<SharedAuthentication onSuccess={onSuccess} />
			</div>
		</Modal>
	);
};

export default memo(AuthModal);
