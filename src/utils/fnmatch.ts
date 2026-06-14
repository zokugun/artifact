import { minimatch } from 'minimatch';

export function fnmatch(filepath: string, glob: string): boolean {
	const matchOptions = { matchBase: true, dot: true, noext: true };

	return minimatch(filepath, glob, matchOptions);
} // }}}

