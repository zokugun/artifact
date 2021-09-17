import { Context } from '../types/context';

export async function insertFinalNewLine({ mergedTextFiles }: Context): Promise<void> {
	for(const file of mergedTextFiles) {
		if(file.finalNewLine) {
			const withFinalNewLine = file.data.endsWith('\n');

			if(!withFinalNewLine) {
				file.data = `${file.data}\n`;
			}
		}
	}
}
