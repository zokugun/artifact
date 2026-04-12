import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { type Context } from '../types/context.js';

export async function renameFiles({ renamedPatterns, targetPath }: Context): AsyncDResult {
	if(renamedPatterns.length === 0) {
		return OK;
	}

	const cwd = path.join(targetPath);

	for(const { from, to } of renamedPatterns) {
		const fromPath = path.join(cwd, from);

		if(await fse.isExisting(fromPath)) {
			const result = await fse.rename(fromPath, path.join(cwd, to));
			if(result.fails) {
				return err(stringifyError(result.error));
			}
		}
	}

	return OK;
}
