import { isArray, isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type AlwaysFileConfig, type FileTransform } from '../../types/config.js';
import { isTransform } from './is-transform.js';

export function normalizeFileAlways(pattern: string, data: unknown): DResult<AlwaysFileConfig> { // {{{
	if(!isRecord(data)) {
		return err('"always" must be an object.');
	}

	let ifExists: 'merge' | 'overwrite' | 'remove' | 'skip' = 'merge';
	let transforms: FileTransform[] = [];

	if(isString(data.if_exists)) {
		if(data.if_exists === 'overwrite' || data.if_exists === 'remove' || data.if_exists === 'skip') {
			ifExists = data.if_exists;
		}
	}
	else if(data.remove === true) {
		ifExists = 'remove';
	}

	if(isArray<FileTransform>(data.transforms, isTransform)) {
		transforms = data.transforms;
	}

	return ok({
		ifExists,
		pattern,
		transforms,
	});
} // }}}
