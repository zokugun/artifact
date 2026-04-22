import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { isMatch } from 'micromatch';
import { type Context } from '../types/context.js';
import { listWorkingFiles } from '../utils/list-working-files.js';

export async function removeFiles({ removedPatterns, targetPath, options }: Context): AsyncDResult {
	if(removedPatterns.length === 0) {
		return OK;
	}

	const cwd = path.join(targetPath);
	const files = await listWorkingFiles(cwd);

	for(const file of files) {
		if(isMatch(file, removedPatterns)) {
			if(!options.dryRun) {
				const filePath = path.join(cwd, file);

				const result = await fse.unlink(filePath);
				if(result.fails) {
					return err(stringifyError(result.error));
				}
			}

			if(options.verbose) {
				logger.debug(`${file} has been removed`);
			}
		}
	}

	return OK;
}
