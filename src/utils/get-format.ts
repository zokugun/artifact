import minimatch from 'editorconfig/src/lib/fnmatch';
import type { Format } from '../types/format.js';

function fnmatch(filepath: string, glob: string): boolean { // {{{
	const matchOptions = { matchBase: true, dot: true, noext: true };

	return minimatch(filepath, glob, matchOptions);
} // }}}

export function getFormat(name: string, formats: Format[]): Format | null {
	for(const format of formats) {
		if(fnmatch(name, format.glob)) {
			return format;
		}
	}

	return null;
}
