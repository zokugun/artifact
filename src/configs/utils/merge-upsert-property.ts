import { isNonEmptyArray } from '@zokugun/is-it-type';
import { type DResult, err, OK } from '@zokugun/xtry';
import { isEqual } from 'lodash-es';
import { type UpsertFileConfig } from '../../types/config.js';

export function mergeUpsertProperty(file: UpsertFileConfig, configs: UpsertFileConfig[]): DResult {
	for(const config of configs) {
		if(config.pattern === file.pattern) {
			return merge(config, file);
		}
	}

	configs.push(file);

	return OK;
}

function merge(currentValue: UpsertFileConfig, newValue: UpsertFileConfig): DResult {
	if(newValue.filter) {
		if(currentValue.filter) {
			return err('Not Implemented: filter');
		}
		else {
			currentValue.filter = newValue.filter;
		}
	}

	if(newValue.ifExists && newValue.ifExists !== 'merge') {
		if(currentValue.ifExists) {
			if(currentValue.ifExists === 'merge' || currentValue.ifExists === newValue.ifExists) {
				// pass
			}
			else {
				return err('Not Implemented: ifExists');
			}
		}
		else {
			currentValue.ifExists = newValue.ifExists;
		}
	}

	if(newValue.ifMissing && newValue.ifMissing !== 'merge') {
		if(currentValue.ifMissing) {
			if(currentValue.ifMissing === 'merge' || currentValue.ifMissing === newValue.ifMissing) {
				// pass
			}
			else {
				return err('Not Implemented: ifMissing');
			}
		}
		else {
			currentValue.ifMissing = newValue.ifMissing;
		}
	}

	if(newValue.rename) {
		if(currentValue.rename) {
			return err('Not Implemented: rename');
		}
		else {
			currentValue.rename = newValue.rename;
		}
	}

	if(newValue.route) {
		if(currentValue.route) {
			return err('Not Implemented: route');
		}
		else {
			currentValue.route = newValue.route;
		}
	}

	if(isNonEmptyArray(newValue.transforms)) {
		if(isNonEmptyArray(currentValue.transforms)) {
			if(!isEqual(currentValue.transforms, newValue.transforms)) {
				return err(`There is a conflict on the "transforms" property for the "${newValue.pattern}" file`);
			}
		}
		else {
			currentValue.transforms = newValue.transforms;
		}
	}

	return OK;
}
