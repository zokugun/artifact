import { isNonEmptyArray } from '@zokugun/is-it-type';
import { type DResult, err, OK } from '@zokugun/xtry';
import { isEqual } from 'es-toolkit';
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

	if(newValue.ifExists && newValue.ifExists !== 'merge' && currentValue.ifExists && currentValue.ifExists === 'merge') {
		currentValue.ifExists = newValue.ifExists;
	}

	if(newValue.ifMissing && newValue.ifMissing !== 'merge' && currentValue.ifMissing && currentValue.ifMissing === 'merge') {
		currentValue.ifMissing = newValue.ifMissing;
	}

	if(newValue.rename) {
		if(currentValue.rename) {
			return err('Not Implemented: rename');
		}
		else {
			currentValue.rename = newValue.rename;
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
