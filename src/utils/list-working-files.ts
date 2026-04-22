import globby from 'globby';

export async function listWorkingFiles(cwd: string): Promise<string[]> {
	return globby(['**/*', '!**/*.lock', '!**/*-lock.*', '!.git', '!**/node_modules/**'], {
		cwd,
		dot: true,
		followSymbolicLinks: false,
	});
}
