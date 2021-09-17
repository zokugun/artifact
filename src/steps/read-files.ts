import path from 'path';
import { getEncoding, isText } from 'istextorbinary';
import globby from 'globby';
import fse from 'fs-extra';
import { Context } from '../types/context';
import { readBuffer } from '../utils/read-buffer';

export async function readFiles(context: Context): Promise<void> {
	const cwd = path.join(context.incomingPath, 'configs');

	const files = await globby(['**/*', '!**/*.lock', '!**/*-lock.*'], {
		cwd,
		dot: true,
	});

	for(const file of files) {
		const filePath = path.join(cwd, file);

		if(isText(file) || getEncoding(await readBuffer(filePath, 24)) === 'utf8') {
			const data = await fse.readFile(filePath, 'utf-8');
			const finalNewLine = data.endsWith('\n');

			if(data.startsWith('#!')) {
				// the text file might be executable
				const { mode } = await fse.stat(filePath);

				context.textFiles.push({
					name: file,
					data,
					mode,
					finalNewLine,
				});

				if(context.options.verbose) {
					console.log(`${file} is a shebang file`);
				}
			}
			else {
				context.textFiles.push({
					name: file,
					data,
					finalNewLine,
				});

				if(context.options.verbose) {
					console.log(`${file} is a text file`);
				}
			}
		}
		else {
			context.binaryFiles.push(file);

			if(context.options.verbose) {
				console.log(`${file} is a binary file`);
			}
		}
	}
}
