import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { getEncoding, isText } from 'istextorbinary';
import { OperationMode, type Context } from '../types/context.js';
import { listWorkingFiles } from '../utils/list-working-files.js';
import { readBuffer } from '../utils/read-buffer.js';
import { readTextFile } from '../utils/read-text-file.js';

export async function readFiles({ incomingPath, textFiles, binaryFiles, patchFiles, operationMode: mode, global, options }: Context): AsyncDResult {
	const files = await listWorkingFiles(incomingPath);

	if(mode === OperationMode.Default) {
		for(const file of files) {
			const filePath = fse.join(incomingPath, file);

			if(fse.leafName(file).startsWith('#') && (file.endsWith('.diff') || file.endsWith('.json-patch') || file.endsWith('.patch'))) {
				patchFiles.push({
					name: fse.join(fse.parentPath(file), fse.leafName(file, 1).slice(1)),
					patchName: file,
					type: file.endsWith('json-patch') ? 'json-patch' : 'patch',
				});

				if(options.verbose) {
					logger.debug(`${file} is a patch`);
				}
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			else if(isText(file) || getEncoding(await readBuffer(filePath, 24)) === 'utf8') {
				const textFile = await readTextFile(file, filePath, options);
				if(textFile.fails) {
					return textFile;
				}

				textFiles.push(textFile.value);
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
	else {
		for(const file of files) {
			if(global.touchedTextFiles.includes(file)) {
				const filePath = fse.join(incomingPath, file);

				const textFile = await readTextFile(file, filePath, options);
				if(textFile.fails) {
					return textFile;
				}

				textFiles.push(textFile.value);
			}
			else if(fse.leafName(file).startsWith('#') && (file.endsWith('.diff') || file.endsWith('.json-patch') || file.endsWith('.patch'))) {
				const name = fse.join(fse.parentPath(file), fse.leafName(file, 1).slice(1));

				if(global.touchedTextFiles.includes(name)) {
					patchFiles.push({
						name,
						patchName: file,
						type: file.endsWith('json-patch') ? 'json-patch' : 'patch',
					});

					if(options.verbose) {
						logger.debug(`${file} is a patch`);
					}
				}
			}
		}
	}

	return OK;
}
