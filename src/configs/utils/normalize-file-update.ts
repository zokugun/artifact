import { isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileUpdate } from '../../types/config.js';
import { normalizeFileUpsert } from './normalize-file-upsert.js';

export function normalizeFileUpdate(data: unknown): DResult<FileUpdate> { // {{{
	if(!isRecord(data)) {
		return err('"update" must be an object.');
	}

	const upsert = normalizeFileUpsert(data, 'update');

	if(upsert.fails) {
		return upsert;
	}

	let missing: boolean = true;
	let update: boolean = true;

	if(data.missing === false) {
		missing = false;
	}

	if(data.update === false) {
		update = false;
	}

	return ok({
		...upsert.value,
		missing,
		update,
	});
} // }}}

