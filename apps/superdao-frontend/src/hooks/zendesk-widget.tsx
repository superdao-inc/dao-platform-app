import Zendesk, { ZendeskAPI } from 'react-zendesk';
import { useMemo } from 'react';

import { ZENDESK_KEY } from 'src/constants';

type Props = {
	defaultValue?: boolean;
};

// we use messenger API, not webWidget, so we cannot even detect if widget is opened/closed
export const useZendeskWidget = (props?: Props) => {
	const { defaultValue } = props || {};

	const handleOnZendesk = () => {
		ZendeskAPI('messenger', 'open');
	};

	const handleOffZendesk = () => {
		ZendeskAPI('messenger', 'close');
	};

	const handleInitZendesk = () => {
		if (!defaultValue) handleOffZendesk();

		// available functionality
		// (window as any).zE('messenger:on', 'unreadMessages', function (count: number) {
		// 	console.log(`You have ${count} unread message(s).`);
		// });
	};

	// React.Memo for unique widget on page
	const Widget = useMemo(
		// eslint-disable-next-line react/display-name
		() => () => <Zendesk zendeskKey={ZENDESK_KEY} onLoaded={handleInitZendesk} />,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return { Widget, controls: { on: handleOnZendesk, off: handleOffZendesk } } as const;
};
