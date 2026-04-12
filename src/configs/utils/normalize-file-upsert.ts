import { isArray, isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileUpsert } from '../../types/config.js';

export function normalizeFileUpsert(data: unknown, name: string): DResult<FileUpsert> { // {{{
	if(!isRecord(data)) {
		return err(`"${name}" must be an object.`);
	}

	let filter: string[] | undefined;
	let overwrite: boolean = false;
	let remove: boolean = false;
	let rename: string | undefined;
	let route: Record<string, any> | undefined;

	if(isArray<string>(data.filter, isString)) {
		filter = data.filter;
	}

	if(data.overwrite === true) {
		overwrite = true;
	}

	if(data.remove === true) {
		remove = true;
	}

	if(isString(data.rename)) {
		rename = data.rename;
	}

	if(isRecord(data.route)) {
		route = data.route;
	}

	return ok({
		filter,
		overwrite,
		remove,
		rename,
		route,
	});
} // }}}
