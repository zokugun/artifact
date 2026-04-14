import { isArray, isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileTransform, type FileUninstall } from '../../types/config.js';
import { isTransform } from './is-transform.js';

export function normalizeFileUninstall(data: unknown): DResult<FileUninstall> { // {{{
	if(!isRecord(data)) {
		return err('"uninstall" must be an object.');
	}

	let remove: boolean = false;
	let transforms: FileTransform[] = [];
	let unmerge: boolean = false;

	if(data.remove === true) {
		remove = true;
	}

	if(isArray<FileTransform>(data.transforms, isTransform)) {
		transforms = data.transforms;
	}

	if(data.unmerge === true) {
		unmerge = true;
	}

	return ok({
		remove,
		transforms,
		unmerge,
	});
} // }}}
