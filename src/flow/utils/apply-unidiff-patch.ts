import { applyUnidiff } from '@zokugun/unidiff-strict';
import { type DResult } from '@zokugun/xtry/sync';

export function applyUnidiffPatch(fileContent: string, patchContent: string): DResult<{ output: string; reject: string }> {
	return applyUnidiff(fileContent, patchContent, {
		ignorePreviouslyApplied: true,
		reject: true,
	});
}
