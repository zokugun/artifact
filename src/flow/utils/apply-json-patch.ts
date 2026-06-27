import { type DResult, ok, stringifyError, xtry } from '@zokugun/xtry/sync';
import { patch } from 'ultrapatch';
import { JSON, JSONC } from '../../parsers/index.js';
import { type Transform } from '../../parsers/jsonc/transform.js';

export function applyJsonPatch(fileContent: string, patchContent: string): DResult<{ output: string; reject: string }> {
	const input = toJSON(fileContent);
	if(input.fails) {
		return input;
	}

	const patches = toJSON(patchContent);
	if(patches.fails) {
		return patches;
	}

	const patchedData = xtry(() => patch(input.value.data as Parameters<typeof patch>[0], patches.value.data as Parameters<typeof patch>[1]), stringifyError);

	if(patchedData.fails) {
		return ok({
			output: fileContent,
			reject: '',
		});
	}
	else {
		const output = input.value.stringify(patchedData.value, input.value.transform);

		return ok({
			output,
			reject: '',
		});
	}
}

function toJSON(data: string): DResult<{ data: unknown; transform: Transform | undefined; stringify: (data: unknown, transform?: Transform) => string }> {
	const result = JSON.parse(data);

	if(result.fails) {
		const result = JSONC.parse(data);
		if(result.fails) {
			return result;
		}

		return ok({
			data: result.value.data,
			transform: result.value.transform,
			stringify: JSONC.stringify,
		});
	}

	return ok({
		data: result.value.data,
		transform: result.value.transform,
		stringify: JSON.stringify,
	});
}
