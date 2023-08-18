import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

export interface IBaseValidation {
	isValid: boolean;
	ErrorModal: () => EmotionJSX.Element;
}

export type CustomError = Error & { code?: string | number; data?: { message?: string } };

export const isCustomError = (err: unknown): err is CustomError =>
	typeof err === 'object' && err !== null && 'code' in err && 'data' in err;
