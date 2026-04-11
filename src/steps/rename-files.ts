import path from 'path';
import fse from 'fs-extra';
import { type Context } from '../types/context.js';

export async function renameFiles({ renamedPatterns, targetPath }: Context): Promise<void> {
	if(renamedPatterns.length === 0) {
		return;
	}

	const cwd = path.join(targetPath);

	for(const { from, to } of renamedPatterns) {
		const fromPath = path.join(cwd, from);
		const exists = await fse.pathExists(fromPath);

		if(exists) {
			await fse.rename(fromPath, path.join(cwd, to));
		}
	}
}
