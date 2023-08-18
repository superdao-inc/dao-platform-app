/**
 * Получить корневой элемент для портала (c фоллбэком для SSR)
 * */
export const getDomContainer = (defaultContainer?: Element | null) => {
	if (defaultContainer) {
		return defaultContainer;
	}

	return typeof document !== 'undefined' ? document.body : null;
};
