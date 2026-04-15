import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { isMatch } from 'micromatch';
import { type FileTransform } from '../types/config.js';
import { type Context } from '../types/context.js';

export async function configureUninstallFileActions(context: Context): AsyncDResult {
	const { uninstall } = context.incomingConfig!;

	if(!uninstall) {
		return OK;
	}

	const cwd = path.join(context.incomingPath, 'configs');
	const transformations: Record<string, FileTransform[]> = {};

	for(const [file, fileUpdate] of Object.entries(uninstall)) {
		const { ifExists, transforms } = fileUpdate;

		if(ifExists === 'remove') {
			context.removedPatterns.push(file);
		}
		else if(ifExists === 'unmerge') {
			const filePath = path.join(cwd, file);

			const result = await fse.readFile(filePath, 'utf8');
			if(result.fails) {
				return err(stringifyError(result.error));
			}

			const data = result.value;
			const finalNewLine = data.endsWith('\n');

			context.textFiles.push({
				name: file,
				data,
				finalNewLine,
			});
		}

		if(transforms) {
			transformations[file] = transforms;
		}
	}

	if(isNonEmptyRecord(transformations)) {
		context.transforms = (file) => {
			for(const [pattern, transforms] of Object.entries(transformations)) {
				if(isMatch(file, pattern)) {
					return transforms;
				}
			}

			return undefined;
		};
	}

	return OK;
}
