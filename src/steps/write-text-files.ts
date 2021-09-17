import path from 'path';
import fse from 'fs-extra';
import { Context } from '../types/context';

export async function writeTextFiles({ mergedTextFiles, targetPath, options }: Context): Promise<void> {
	for(const file of mergedTextFiles) {
		const filePath = path.join(targetPath, file.name);

		await fse.outputFile(filePath, file.data, 'utf-8');

		if(file.mode) {
			await fse.chmod(filePath, file.mode);
		}

		if(options.verbose) {
			console.log(`${file.name} has been written as a text file`);
		}
	}
}
