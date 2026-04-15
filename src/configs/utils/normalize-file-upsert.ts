import { isArray, isBoolean, isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileTransform, type FileUpsert } from '../../types/config.js';
import { isTransform } from './is-transform.js';

export function normalizeFileUpsert(data: unknown, name: 'install' | 'update' | 'upsert'): DResult<FileUpsert> { // {{{
	if(!isRecord(data)) {
		return err(`"${name}" must be an object.`);
	}

	let filter: string[] | undefined;
	let ifExists: 'force-merge' | 'merge' | 'overwrite' | 'remove' | 'skip' = 'merge';
	let ifMissing: 'merge' | 'skip' = 'merge';
	let rename: string | undefined;
	let route: Record<string, any> | undefined;
	let transforms: FileTransform[] = [];

	if(isArray<string>(data.filter, isString)) {
		filter = data.filter;
	}

	if(isString(data.if_exists)) {
		if(data.if_exists === 'overwrite' || data.if_exists === 'remove' || data.if_exists === 'skip') {
			ifExists = data.if_exists;
		}
	}
	else if(data.overwrite === true) {
		ifExists = 'overwrite';
	}
	else if(data.remove === true) {
		ifExists = 'remove';
	}
	else if(isBoolean(data.update)) {
		ifExists = data.update ? 'force-merge' : 'skip';
	}

	if(data.missing === false || data.if_missing === 'skip') {
		ifMissing = 'skip';
	}

	if(isString(data.rename)) {
		rename = data.rename;
	}

	if(isRecord(data.route)) {
		route = data.route;
	}

	if(isArray<FileTransform>(data.transforms, isTransform)) {
		transforms = data.transforms;
	}

	return ok({
		filter,
		ifExists,
		ifMissing,
		rename,
		route,
		transforms,
	});
} // }}}
