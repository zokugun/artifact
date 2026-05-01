import { stripVTControlCharacters } from 'node:util';

export function formatTable(rows: string[][], align: string, spaces: string = '  '): string[] {
	const maxLength: number[] = [];

	for(const row of rows) {
		for(const [index, cell] of row.entries()) {
			const length = getVisualLength(cell);

			if(!maxLength[index] || maxLength[index] < length) {
				maxLength[index] = length;
			}
		}
	}

	const lines: string[] = [];

	for(const row of rows) {
		const cells: string[] = [];

		for(const [index, cell] of row.entries()) {
			const pad = align[index] === 'R' ? visualPadStart : visualPadEnd;

			cells.push(pad(cell, maxLength[index]));
		}

		lines.push(cells.join(spaces));
	}

	return lines;
}

function getVisualLength(cell: string): number {
	if(cell === '') {
		return 0;
	}

	cell = stripVTControlCharacters(cell);

	let width = 0;

	for(let i = 0; i < cell.length; i++) {
		const code = cell.codePointAt(i);

		if(!code) {
			continue;
		}

		// Ignore control characters
		if(code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if(code >= 0x3_00 && code <= 0x3_6F) {
			continue;
		}

		// Surrogates
		if(code > 0xFF_FF) {
			i++;
		}

		width += 1;
	}

	return width;
}

function visualPadStart(text: string, pad: number, char: string = ' '): string {
	return text.padStart(pad - getVisualLength(text) + text.length, char);
}

function visualPadEnd(text: string, pad: number, char: string = ' '): string {
	return text.padEnd(pad - getVisualLength(text) + text.length, char);
}
