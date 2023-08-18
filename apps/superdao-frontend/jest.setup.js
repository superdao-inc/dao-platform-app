const { publicRuntimeConfig } = require('./next.config');

jest.mock('next/config', () => () => ({ publicRuntimeConfig }));

// mocks for react-slick
// https://github.com/akiran/react-slick/blob/master/test-setup.js

window.matchMedia ??= function () {
	return {
		matches: false,
		addListener: function () {},
		removeListener: function () {}
	};
};

window.requestAnimationFrame ??= function (callback) {
	setTimeout(callback, 0);
};
