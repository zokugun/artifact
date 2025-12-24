import path from 'path';
import fse from 'fs-extra';
import globby from 'globby';
import { isMatch } from 'micromatch';
import { Context } from '../types/context';

export async function removeFiles({ removedPatterns, targetPath, options }: Context): Promise<void> {
	if(removedPatterns.length === 0) {
		return;
	}

	const cwd = path.join(targetPath);

	const files = await globby(['**/*', '!**/*.lock', '!**/*-lock.*', '!.git'], {
		cwd,
		dot: true,
	});

	for(const file of files) {
		if(isMatch(file, removedPatterns)) {
			const filePath = path.join(cwd, file);

			await fse.unlink(filePath);

			if(options.verbose) {
				console.log(`${file} has been removed`);
			}
		}
	}
}
