import { isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileUninstall } from '../../types/config.js';

export function normalizeFileUninstall(data: unknown): DResult<FileUninstall> { // {{{
	if(!isRecord(data)) {
		return err('"uninstall" must be an object.');
	}

	let remove: boolean = false;

	if(data.remove === true) {
		remove = true;
	}

	return ok({
		remove,
	});
} // }}}
