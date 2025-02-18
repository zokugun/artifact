import path from 'path';
import fse from 'fs-extra';
import { Context } from '../types/context';

export async function copyBinaryFiles({ binaryFiles, incomingPath, targetPath, onMissing, onUpdate, options }: Context): Promise<void> {
	const cwd = path.join(incomingPath, 'configs');

	for(const file of binaryFiles) {
		try {
			await fse.access(path.join(targetPath, file.source));

			if(onUpdate(file.source)) {
				continue;
			}
		}
		catch {
			if(onMissing(file.source)) {
				continue;
			}
		}

		const source = path.join(cwd, file.source);
		const target = path.join(targetPath, file.target);

		await fse.copyFile(source, target);

		if(options.verbose) {
			console.log(`${file.target} has been written as a binary file`);
		}
	}
}
