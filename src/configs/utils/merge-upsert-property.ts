import { type DResult, err, OK } from '@zokugun/xtry';
import { isEqual } from 'lodash-es';
import { type FileUpsert } from '../../types/config.js';

export function mergeUpsertProperty(key: string, oldValue: FileUpsert, newValue: FileUpsert): DResult {
	if(newValue.filter) {
		if(oldValue.filter) {
			return err('Not Implemented: filter');
		}
		else {
			oldValue.filter = newValue.filter;
		}
	}

	if(newValue.ifExists && newValue.ifExists !== 'merge') {
		if(oldValue.ifExists) {
			if(oldValue.ifExists === 'merge' || oldValue.ifExists === newValue.ifExists) {
				// pass
			}
			else {
				return err('Not Implemented: ifExists');
			}
		}
		else {
			oldValue.ifExists = newValue.ifExists;
		}
	}

	if(newValue.ifMissing && newValue.ifMissing !== 'merge') {
		if(oldValue.ifMissing) {
			if(oldValue.ifMissing === 'merge' || oldValue.ifMissing === newValue.ifMissing) {
				// pass
			}
			else {
				return err('Not Implemented: ifMissing');
			}
		}
		else {
			oldValue.ifMissing = newValue.ifMissing;
		}
	}

	if(newValue.rename) {
		if(oldValue.rename) {
			return err('Not Implemented: rename');
		}
		else {
			oldValue.rename = newValue.rename;
		}
	}

	if(newValue.route) {
		if(oldValue.route) {
			return err('Not Implemented: route');
		}
		else {
			oldValue.route = newValue.route;
		}
	}

	if(newValue.transforms && newValue.transforms.length > 0) {
		if(oldValue.transforms) {
			if(!isEqual(oldValue.transforms, newValue.transforms)) {
				return err(`There is a conflict on the "transforms" property for the "${key}" file`);
			}
		}
		else {
			oldValue.transforms = newValue.transforms;
		}
	}

	return OK;
}
