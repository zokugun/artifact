import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from 'fs-extra';
import { type Context } from '../types/context.js';

export async function copyBinaryFiles({ binaryFiles, incomingPath, targetPath, onExisting, onMissing, options }: Context): Promise<void> {
	const cwd = path.join(incomingPath, 'configs');

	for(const file of binaryFiles) {
		const source = path.join(cwd, file.source);
		const target = path.join(targetPath, file.target);

		const exists = await fse.pathExists(target);

		if(exists) {
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
			await fse.ensureFile(target);

			await fse.copyFile(source, target);
		}

		if(options.verbose) {
			logger.debug(`${file.target} has been written as a binary file`);
		}
	}
}
