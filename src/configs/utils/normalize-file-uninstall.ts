import { isArray, isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileTransform, type FileUninstall } from '../../types/config.js';
import { isTransform } from './is-transform.js';

export function normalizeFileUninstall(data: unknown): DResult<FileUninstall> { // {{{
	if(!isRecord(data)) {
		return err('"uninstall" must be an object.');
	}

	let ifExists: 'remove' | 'skip' | 'unmerge' = 'skip';
	let transforms: FileTransform[] = [];

	if(isString(data.if_exists)) {
		if(data.if_exists === 'remove' || data.if_exists === 'unmerge') {
			ifExists = data.if_exists;
		}
	}
	else if(data.remove === true) {
		ifExists = 'remove';
	}
	else if(data.unmerge === true) {
		ifExists = 'unmerge';
	}

	if(isArray<FileTransform>(data.transforms, isTransform)) {
		transforms = data.transforms;
	}

	return ok({
		ifExists,
		transforms,
	});
} // }}}
