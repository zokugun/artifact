import { IndentStyle } from '../types/format.js';

const INDENT_REGEX = /^(?:(\t+)|( +))/;
const LINE_SEPARATOR_REGEX = /\r\n|\r|\n/;

export function detectIndent(text: string): { style: IndentStyle; size: number } {
	const lines = text.split(LINE_SEPARATOR_REGEX);

	const indentations = new Set<number>();
	let spaces = 0;
	let tabs = 0;

	for(const line of lines) {
		const match = INDENT_REGEX.exec(line);

		if(match) {
			if(match[1]) {
				tabs += 1;
			}
			else {
				indentations.add(match[2].length);
				spaces += 1;
			}
		}
	}

	if(tabs > spaces) {
		return {
			style: IndentStyle.TAB,
			size: 1,
		};
	}

	const sorted = [...indentations].sort((a, b) => a - b);

	const diffs: number[] = [];
	for(let i = 1; i < sorted.length; i++) {
		const d = sorted[i] - sorted[i - 1];
		if(d > 0) {
			diffs.push(d);
		}
	}

	let size = sorted[0];

	if(diffs.length > 0) {
		size = diffs.shift()!;

		for(const value of diffs) {
			size = gcd(size, value);
		}
	}

	if(!size || size === 0) {
		size = sorted[0];
	}

	return {
		style: IndentStyle.SPACE,
		size,
	};
}

function gcd(a: number, b: number): number { // {{{
	while(b !== 0) {
		const t = a % b;
		a = b;
		b = t;
	}

	return Math.abs(a);
} // }}}
