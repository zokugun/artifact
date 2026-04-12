import { type AsyncDResult, OK } from '@zokugun/xtry';
import { type TextFile } from '../types/text-file.js';

export async function insertFinalNewLine({ mergedTextFiles }: { mergedTextFiles: TextFile[] }): AsyncDResult {
	for(const file of mergedTextFiles) {
		if(file.finalNewLine) {
			const withFinalNewLine = file.data.endsWith('\n');

			if(!withFinalNewLine) {
				file.data = `${file.data}\n`;
			}
		}
	}

	return OK;
}
