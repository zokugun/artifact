import { TextFile } from '../types/text-file';

export async function insertFinalNewLine({ mergedTextFiles }: { mergedTextFiles: TextFile[] }): Promise<void> {
	for(const file of mergedTextFiles) {
		if(file.finalNewLine) {
			const withFinalNewLine = file.data.endsWith('\n');

			if(!withFinalNewLine) {
				file.data = `${file.data}\n`;
			}
		}
	}
}
