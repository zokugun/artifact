import { type AsyncDResult, OK } from '@zokugun/xtry/async';
import { type ArtifactResult } from '../types/config.js';
import { type FlowEntry } from '../types/context.js';

export async function pushEntry(entry: FlowEntry, top: boolean, result: ArtifactResult | undefined, entries: FlowEntry[], availables: string[], features: string[]): AsyncDResult {
	if(!entry.branch) {
		const id = entry.variant ? `${entry.name}:${entry.variant}` : entry.name;

		if(availables.includes(id)) {
			return OK;
		}
	}

	availables.push(entry.name);

	if(entry.variant) {
		availables.push(`${entry.name}:${entry.variant}`);
	}

	if(top) {
		entry.result = result;
	}

	entries.push(entry);

	if(entry.variant && result && ((result.requires && entry.variant !== result.requires[0]) || !result.requires)) {
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
