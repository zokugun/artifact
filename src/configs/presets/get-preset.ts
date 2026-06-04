import { getDefaultPreset } from './get-default-preset.js';
import { getDefaultSortPreset } from './get-default-sort-preset.js';
import { getPackagePreset } from './get-package-preset.js';

export function getPreset(name: string): Record<string, unknown> | undefined {
	if(name === 'default') {
		return getDefaultPreset();
	}
	else if(name === 'default(sort)') {
		return getDefaultSortPreset();
	}
	else if(name === 'package') {
		return getPackagePreset();
	}
	else if(name === 'map(sort, concat)') {
		return {
			'map(sort)': 'map(concat)',
		};
	}

	return undefined;
}
