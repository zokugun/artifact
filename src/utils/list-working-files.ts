import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, stringifyError, err } from '@zokugun/xtry';

export async function listWorkingFiles(cwd: string): AsyncDResult<string[]> {
	const files = await fse.walk(cwd, {
		asPaths: true,
		collect: true,
		emptyIfDirMissing: true,
		followSymlinks: false,
		glob: fse.gb.pico(['**/*', '!**/*.lock', '!**/*-lock.*', '!.git', '!**/node_modules/**'], { dot: true }),
		onlyFiles: true,
	});

	if(files.fails) {
		return err(stringifyError(files.error));
	}

	return files;
}
