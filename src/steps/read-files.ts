import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import globby from 'globby';
import { getEncoding, isText } from 'istextorbinary';
import { type Context } from '../types/context.js';
import { detectIndent } from '../utils/detect-indent.js';
import { hasFinalNewLine } from '../utils/has-final-new-line.js';
import { readBuffer } from '../utils/read-buffer.js';

export async function readFiles({ incomingPath, textFiles, binaryFiles, options }: Context): AsyncDResult {
	const cwd = path.join(incomingPath, 'configs');

	const files = await globby(['**/*', '!**/*.lock', '!**/*-lock.*'], {
		cwd,
		dot: true,
	});

	for(const file of files) {
		const filePath = path.join(cwd, file);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		if(isText(file) || getEncoding(await readBuffer(filePath, 24)) === 'utf8') {
			const result = await fse.readFile(filePath, 'utf8');
			if(result.fails) {
				return err(stringifyError(result.error));
			}

			const data = result.value;
			const finalNewLine = hasFinalNewLine(data);
			const indent = detectIndent(data);

			if(data.startsWith('#!')) {
				// the text file might be executable
				const result = await fse.stat(filePath);
				if(result.fails) {
					return err(stringifyError(result.error));
				}

				const { mode } = result.value;

				textFiles.push({
					name: file,
					data,
					finalNewLine,
					indent,
					mode,
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
					indent,
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

	return OK;
}
