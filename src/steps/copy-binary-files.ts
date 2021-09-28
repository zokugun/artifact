import path from 'path';
import fse from 'fs-extra';
import { Context } from '../types/context';

export async function copyBinaryFiles({ binaryFiles, incomingPath, targetPath, onMissing, onUpdate, options }: Context): Promise<void> {
	const cwd = path.join(incomingPath, 'configs');

	for(const file of binaryFiles) {
		try {
			await fse.access(path.join(targetPath, file));

			if(onUpdate(file)) {
				continue;
			}
		}
		catch {
			if(onMissing(file)) {
				continue;
			}
		}

		const source = path.join(cwd, file);
		const target = path.join(targetPath, file);

		await fse.copyFile(source, target);

		if(options.verbose) {
			console.log(`${file} has been written as a binary file`);
		}
	}
}
