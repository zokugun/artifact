import detectIndent from 'detect-indent';
import minimatch from 'editorconfig/src/lib/fnmatch';
import { Format, IndentStyle } from '../types/format';
import { TextFile } from '../types/text-file';

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

function fnmatch(filepath: string, glob: string): boolean { // {{{
	const matchOptions = { matchBase: true, dot: true, noext: true };
	return minimatch(filepath, glob, matchOptions);
} // }}}

function indentWithSpace(data: string, size: number): string { // {{{
	const { type, indent } = detectIndent(data);

	if(type === 'space') {
		if(indent.length === size) {
			return data;
		}
		else {
			data = data.replace(new RegExp(indent, 'gm'), '\t');

			const newIndent = ' '.repeat(size);

			return data.replace(/\t/gm, newIndent);
		}
	}
	else if(type === 'tab') {
		const newIndent = ' '.repeat(size);

		return data.replace(new RegExp(indent, 'gm'), newIndent);
	}
	else {
		return data;
	}
} // }}}

function indentWithTab(data: string): string { // {{{
	const { type, indent, amount } = detectIndent(data);

	if(type === 'space' && amount > 1) {
		return data.replace(new RegExp(indent, 'gm'), '\t');
	}
	else {
		return data;
	}
} // }}}

export async function applyFormatting({ mergedTextFiles, formats }: { mergedTextFiles: TextFile[]; formats: Format[] }): Promise<void> {
	for(const file of mergedTextFiles) {
		for(const format of formats) {
			if(fnmatch(file.name, format.glob)) {
				applyFormat(file, format);

				break;
			}
		}
	}
}
