import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { minimatch } from 'minimatch';
import { OperationMode, type Context } from '../types/context.js';
import { listWorkingFiles } from '../utils/list-working-files.js';

export async function removeFiles({ removedPatterns, targetPath, operationMode: mode, options }: Context): AsyncDResult {
	if(removedPatterns.length === 0 || mode !== OperationMode.Default) {
		return OK;
	}

	const cwd = fse.join(targetPath);
	const files = await listWorkingFiles(cwd);

	for(const file of files) {
		if(removedPatterns.some((pattern) => minimatch(file, pattern))) {
			if(!options.dryRun) {
				const filePath = fse.join(cwd, file);

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
