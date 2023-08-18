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
/**
 * Notice: I (Jamie Sinclair) have modified the code to only use Multi-threading only
 * if the browser has the `hardwareConcurrency` property. This is because it helps
 * us support environments like Cloudflare Workers that use the V8 engine.
 */
import type { InitInput } from '../wasm/oxipng/pkg/squoosh_oxipng';
interface OptimiseOptions {
	level: number;
	interlace: boolean;
}
export declare function init(moduleOrPath?: InitInput): void;
export default function optimise(data: ArrayBuffer, options?: Partial<OptimiseOptions>): Promise<ArrayBuffer>;
