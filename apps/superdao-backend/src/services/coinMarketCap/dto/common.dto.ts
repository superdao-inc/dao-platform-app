export type BaseResponse = {
	status: {
		timestamp: string;

		// eslint-disable-next-line camelcase
		error_code: number;

		// eslint-disable-next-line camelcase
		error_message: string | null;

		elapsed: number;

		// eslint-disable-next-line camelcase
		credit_count: number;

		notice: null;
	};
	data: object;
};
