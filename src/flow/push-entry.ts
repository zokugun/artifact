import { isString } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry/async';
import { readPackageConfig } from '../configs/index.js';
import { type ArtifactResult } from '../types/config.js';
import { type FlowEntry, type OperationType, type Global } from '../types/context.js';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export async function pushEntry(entry: PartialBy<FlowEntry, 'config'>, top: boolean, result: ArtifactResult | undefined, entries: FlowEntry[], features: string[], operationType: OperationType, global: Global): AsyncDResult {
	if(!entry.config) {
		const result = await readPackageConfig(entry.dir, global.routes, operationType);
		if(result.fails) {
			return result;
		}

		entry.config = result.value;
	}

	if(top) {
		entry.result = result;
	}

	entries.push(entry as FlowEntry);

	if(isString(entry.variant) && result && ((result.requires && entry.variant !== result.requires[0]) || !result.requires)) {
		result.provides ??= [];

		result.provides.push(entry.variant);
	}

	if(entry.config.features.length > 0) {
		features ??= [];

		features.push(...entry.config.features);

		if(result) {
			result.features ??= [];

			result.features.push(...entry.config.features);
		}
	}

	return OK;
}
