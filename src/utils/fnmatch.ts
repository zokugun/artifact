import minimatch from 'editorconfig/src/lib/fnmatch';

export function fnmatch(filepath: string, glob: string): boolean {
	const matchOptions = { matchBase: true, dot: true, noext: true };

	return minimatch(filepath, glob, matchOptions);
} // }}}

