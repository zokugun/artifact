import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { type Context } from '../types/context.js';

export async function copyBinaryFiles({ binaryFiles, incomingPath, targetPath, onExisting, onMissing, options }: Context): AsyncDResult {
	const cwd = path.join(incomingPath, 'configs');

	for(const file of binaryFiles) {
		const source = path.join(cwd, file.source);
		const target = path.join(targetPath, file.target);

		if(await fse.isExisting(target)) {
			switch(onExisting(file.source)) {
				case 'merge': {
					break;
				}

				case 'overwrite': {
					break;
				}

				case 'skip': {
					continue;
				}
			}
		}
		else {
			switch(onMissing(file.source)) {
				case 'continue': {
					break;
				}

				case 'skip': {
					continue;
				}
			}
		}

		if(!options.dryRun) {
			const ensureResult = await fse.ensureFile(target);
			if(ensureResult.fails) {
				return err(stringifyError(ensureResult.error));
			}

			const copyResult = await fse.copyFile(source, target);
			if(copyResult.fails) {
				return err(stringifyError(copyResult.error));
			}
		}

		if(options.verbose) {
			logger.debug(`${file.target} has been written as a binary file`);
		}
	}

	return OK;
}
