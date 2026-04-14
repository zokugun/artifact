import { type AsyncDResult, OK } from '@zokugun/xtry';
import { type TextFile } from '../types/text-file.js';

export async function insertFinalNewLine({ mergedTextFiles, transformedFiles }: { mergedTextFiles: TextFile[]; transformedFiles?: TextFile[] }): AsyncDResult {
	for(const file of mergedTextFiles) {
		if(file.finalNewLine) {
			const withFinalNewLine = file.data.endsWith('\n');

			if(!withFinalNewLine) {
				file.data = `${file.data}\n`;
			}
		}
	}

	if(transformedFiles) {
		for(const file of transformedFiles) {
			if(file.finalNewLine) {
				const withFinalNewLine = file.data.endsWith('\n');

				if(!withFinalNewLine) {
					file.data = `${file.data}\n`;
				}
			}
		}
	}

	return OK;
}
