import * as jq from 'jq-wasm';
import { type FileTransform } from '../types/config.js';

export function applyTransforms(transforms: FileTransform[] | undefined): (data: Record<string, unknown>) => Promise<Record<string, unknown>> {
	if(!transforms) {
		return async (data) => data;
	}

	return async (data) => {
		for(const transform of transforms) {
			data = await jq.json(data, transform.jq) as Record<string, unknown>;
		}

		return data;
	};
}
