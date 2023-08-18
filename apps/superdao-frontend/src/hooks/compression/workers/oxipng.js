/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const label = 'OXIPNG';
const mimeType = 'image/png';
const extension = 'png';
const defaultOptions = {
	level: 2,
	interlace: false
};

import { threads } from 'wasm-feature-detect';
async function initMT(moduleOrPath) {
	const { default: init, initThreadPool, optimise } = await import('../wasm/oxipng/pkg-parallel/squoosh_oxipng');
	await init(moduleOrPath);
	await initThreadPool(globalThis.navigator.hardwareConcurrency);
	return optimise;
}
async function initST(moduleOrPath) {
	const { default: init, optimise } = await import('../wasm/oxipng/pkg/squoosh_oxipng');
	await init(moduleOrPath);
	return optimise;
}
let wasmReady;
export function init(moduleOrPath) {
	var _a;
	if (!wasmReady) {
		const hasHardwareConcurrency =
			((_a = globalThis.navigator) === null || _a === void 0 ? void 0 : _a.hardwareConcurrency) > 1;
		wasmReady = hasHardwareConcurrency
			? threads().then((hasThreads) => (hasThreads ? initMT(moduleOrPath) : initST(moduleOrPath)))
			: initST(moduleOrPath);
	}
}
export default async function optimise(data, options = {}) {
	init();
	const _options = { ...defaultOptions, ...options };
	const optimise = await wasmReady;
	return optimise(new Uint8Array(data), _options.level, _options.interlace).buffer;
}
