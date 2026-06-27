import { applyUnidiff, mergeUnidiff, type Unidiff } from '@zokugun/unidiff-strict';
import { type DResult } from '@zokugun/xtry/sync';

export function mergeAndApplyUnidiff(fileContent: string, patches: string[]): DResult<{ output: string; reject: string }> {
	let patch: Unidiff | string;

	if(patches.length === 1) {
		patch = patches[0];
	}
	else {
		const result = mergeUnidiff(patches);
		if(result.fails) {
			return result;
		}

		patch = result.value;
	}

	return applyUnidiff(fileContent, patch, {
		ignorePreviouslyApplied: true,
		reject: true,
	});
}
