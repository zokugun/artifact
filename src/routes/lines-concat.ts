import { trimFinalNewLine } from '../utils/trim-final-newline';
import { toLines } from '../utils/to-lines';
import { listConcat } from './list-concat';

export function linesConcat({ current, incoming }: { current: string | undefined; incoming: string | undefined }): string {
	if(!incoming) {
		return current ?? '';
	}

	if(!current) {
		return incoming;
	}

	const currentLines = toLines(trimFinalNewLine(current));
	const incomingLines = toLines(trimFinalNewLine(incoming));

	const result = listConcat({
		current: currentLines,
		incoming: incomingLines,
	});

	return result.join('\n');
}
