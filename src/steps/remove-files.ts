import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from 'fs-extra';
import globby from 'globby';
import { isMatch } from 'micromatch';
import { type Context } from '../types/context.js';

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
			if(!options.dryRun) {
				const filePath = path.join(cwd, file);

				await fse.unlink(filePath);
			}

			if(options.verbose) {
				logger.debug(`${file} has been removed`);
			}
		}
	}
}
