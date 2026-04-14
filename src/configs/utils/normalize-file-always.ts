import { isArray, isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileAlways, type FileTransform } from '../../types/config.js';
import { isTransform } from './is-transform.js';

export function normalizeFileAlways(data: unknown): DResult<FileAlways> { // {{{
	if(!isRecord(data)) {
		return err('"always" must be an object.');
	}

	let remove: boolean = false;
	let transforms: FileTransform[] = [];

	if(data.remove === true) {
		remove = true;
	}

	if(isArray<FileTransform>(data.transforms, isTransform)) {
		transforms = data.transforms;
	}

	return ok({
		remove,
		transforms,
	});
} // }}}
