import { type AsyncDResult, OK } from '@zokugun/xtry';
import detectIndent from 'detect-indent';
import { type Format, IndentStyle } from '../types/format.js';
import { type TextFile } from '../types/text-file.js';
import { getFormat } from '../utils/get-format.js';

function applyFormat(file: TextFile, format: Format): void { // {{{
	if(format.indentStyle === IndentStyle.SPACE) {
		file.data = indentWithSpace(file.data, format.indentSize);
	}
	else {
		file.data = indentWithTab(file.data);
	}

	if(format.insertFinalNewline) {
		const withFinalNewLine = file.data.endsWith('\n');

		if(!withFinalNewLine) {
			file.data = `${file.data}\n`;
		}
	}
} // }}}

function indentWithSpace(data: string, size: number): string { // {{{
	const { type, indent } = detectIndent(data);

	if(type === 'space') {
		if(indent.length === size) {
			return data;
		}
		else {
			data = data.replaceAll(new RegExp(indent, 'gm'), '\t');

			const newIndent = ' '.repeat(size);

			return data.replaceAll(/\t/gm, newIndent);
		}
	}
	else if(type === 'tab') {
		const newIndent = ' '.repeat(size);

		return data.replaceAll(new RegExp(indent, 'gm'), newIndent);
	}
	else {
		return data;
	}
} // }}}

function indentWithTab(data: string): string { // {{{
	const { type, indent, amount } = detectIndent(data);

	if(type === 'space' && amount > 1) {
		return data.replaceAll(new RegExp(indent, 'gm'), '\t');
	}
	else {
		return data;
	}
} // }}}

export async function applyFormatting({ formats, mergedTextFiles, transformedFiles }: { formats: Format[]; mergedTextFiles: TextFile[]; transformedFiles?: TextFile[] }): AsyncDResult {
	for(const file of mergedTextFiles) {
		const format = getFormat(file.name, formats);

		if(format) {
			applyFormat(file, format);
		}
	}

	if(transformedFiles) {
		for(const file of transformedFiles) {
			const format = getFormat(file.name, formats);

			if(format) {
				applyFormat(file, format);
			}
		}
	}

	return OK;
}
