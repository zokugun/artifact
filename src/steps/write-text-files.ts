import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from 'fs-extra';
import { type Context } from '../types/context.js';

export async function writeTextFiles({ mergedTextFiles, targetPath, options }: Context): Promise<void> {
	if(options.dryRun) {
		if(options.verbose) {
			for(const file of mergedTextFiles) {
				logger.debug(`${file.name} has been written as a text file`);
			}
		}
	}
	else {
		for(const file of mergedTextFiles) {
			const filePath = path.join(targetPath, file.name);

			await fse.outputFile(filePath, file.data, 'utf8');

			if(file.mode) {
				await fse.chmod(filePath, file.mode);
			}

			if(options.verbose) {
				logger.debug(`${file.name} has been written as a text file`);
			}
		}
	}
}
