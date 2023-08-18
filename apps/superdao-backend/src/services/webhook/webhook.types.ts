export type WebhookFormMessageBodyData = {
	data: {
		result: number;
		lead2: Record<string, { value: string; type: string }>;
	};
};
