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

	for(const file of uninstall) {
		const { ifExists, pattern, transforms } = file;

		if(ifExists === 'remove') {
			context.removedPatterns.push(pattern);
		}
		else if(ifExists === 'unmerge') {
			const filePath = path.join(cwd, pattern);

			const result = await fse.readFile(filePath, 'utf8');
			if(result.fails) {
				return err(stringifyError(result.error));
			}

			const data = result.value;
			const finalNewLine = data.endsWith('\n');

			context.textFiles.push({
				name: pattern,
				data,
				finalNewLine,
			});
		}

		if(transforms) {
			transformations[pattern] = transforms;
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
