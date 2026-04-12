import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from 'fs-extra';
import globby from 'globby';
import { getEncoding, isText } from 'istextorbinary';
import { type Context } from '../types/context.js';
import { readBuffer } from '../utils/read-buffer.js';

export async function readFiles({ incomingPath, textFiles, binaryFiles, options }: Context): Promise<void> {
	const cwd = path.join(incomingPath, 'configs');

	const files = await globby(['**/*', '!**/*.lock', '!**/*-lock.*'], {
		cwd,
		dot: true,
	});

	for(const file of files) {
		const filePath = path.join(cwd, file);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		if(isText(file) || getEncoding(await readBuffer(filePath, 24)) === 'utf8') {
			const data = await fse.readFile(filePath, 'utf8');
			const finalNewLine = data.endsWith('\n');

			if(data.startsWith('#!')) {
				// the text file might be executable
				const { mode } = await fse.stat(filePath);

				textFiles.push({
					name: file,
					data,
					mode,
					finalNewLine,
				});

				if(options.verbose) {
					logger.debug(`${file} is a shebang file`);
				}
			}
			else {
				textFiles.push({
					name: file,
					data,
					finalNewLine,
				});

				if(options.verbose) {
					logger.debug(`${file} is a text file`);
				}
			}
		}
		else {
			binaryFiles.push({
				source: file,
				target: file,
			});

			if(options.verbose) {
				logger.debug(`${file} is a binary file`);
			}
		}
	}
}
