import { type AsyncDResult, OK } from '@zokugun/xtry';
import { type TextFile } from '../types/context.js';
import { type Format, IndentStyle } from '../types/format.js';
import { detectIndent } from '../utils/detect-indent.js';
import { getFormat } from '../utils/get-format.js';

function applyFormat(file: TextFile, format: Omit<Format, 'glob'>): void { // {{{
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
	const indent = detectIndent(data);

	if(!indent) {
		return data;
	}
	else if(indent.style === IndentStyle.SPACE) {
		if(indent.size === size) {
			return data;
		}
		else {
			const oldIndent = ' '.repeat(indent.size);
			const newIndent = ' '.repeat(size);
			const space2tab = new RegExp(`^(?:${oldIndent})+`, 'gm');

			data = data.replaceAll(space2tab, (spaces) => '\t'.repeat(spaces.length / indent.size));

			return data.replaceAll(/^\t+/gm, (tabs) => newIndent.repeat(tabs.length));
		}
	}
	else if(indent.style === IndentStyle.TAB) {
		const newIndent = ' '.repeat(size);

		return data.replaceAll(/^\t+/gm, (tabs) => newIndent.repeat(tabs.length));
	}
	else {
		return data;
	}
} // }}}

function indentWithTab(data: string): string { // {{{
	const indent = detectIndent(data);

	if(!indent) {
		return data;
	}
	else if(indent.style === IndentStyle.SPACE) {
		const oldIndent = ' '.repeat(indent.size);
		const space2tab = new RegExp(`^(?:${oldIndent})+`, 'gm');

		return data.replaceAll(space2tab, (spaces) => '\t'.repeat(spaces.length / indent.size));
	}
	else {
		return data;
	}
} // }}}

export async function applyFormatting({ formats, mergedTextFiles, transformedFiles }: { formats: Format[]; mergedTextFiles: TextFile[];transformedFiles?: TextFile[] }): AsyncDResult {
	for(const file of mergedTextFiles) {
		const format = getFormat(file.name, formats);

		if(format) {
			applyFormat(file, format);
		}
		else if(file.indent) {
			applyFormat(file, {
				indentStyle: file.indent.style,
				indentSize: file.indent.size,
				insertFinalNewline: file.finalNewLine,
			});
		}
	}

	if(transformedFiles) {
		for(const file of transformedFiles) {
			const format = getFormat(file.name, formats);

			if(format) {
				applyFormat(file, format);
			}
			else if(file.indent) {
				applyFormat(file, {
					indentStyle: file.indent.style,
					indentSize: file.indent.size,
					insertFinalNewline: file.finalNewLine,
				});
			}
		}
	}

	return OK;
}
