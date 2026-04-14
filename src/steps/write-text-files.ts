import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { type Context } from '../types/context.js';

export async function writeTextFiles({ mergedTextFiles, options, targetPath, transformedFiles }: Context): AsyncDResult {
	if(options.dryRun) {
		if(options.verbose) {
			for(const file of mergedTextFiles) {
				logger.debug(`${file.name} has been written as a text file`);
			}
		}
	}
	else {
		for(const file of [...mergedTextFiles, ...transformedFiles]) {
			const filePath = path.join(targetPath, file.name);

			const result = await fse.outputFile(filePath, file.data, 'utf8');
			if(result.fails) {
				return err(stringifyError(result.error));
			}

			if(file.mode) {
				const result = await fse.chmod(filePath, file.mode);
				if(result.fails) {
					return err(stringifyError(result.error));
				}
			}

			if(options.verbose) {
				logger.debug(`${file.name} has been written as a text file`);
			}
		}
	}

	return OK;
}
