import { splitCommand, joinCommand, mergeWithSemicolonMix, mergeAndChains, mergeOrSegments, mergeSemicolonSegments, mergeCommandRecords } from '../utils/command/index.js';

export async function command({ current, incoming }: { current: string | undefined; incoming: string | undefined }): Promise<string> {
	if(!incoming) {
		return current ?? '';
	}

	if(!current) {
		return incoming;
	}

	const trueAndMatch = /^true\s*&&\s*(.+)$/.exec(incoming);
	const currentSegments = new Set(current.split(/;|&&|\|\|/).map((s) => s.trim()).filter(Boolean));

	if(currentSegments.has(incoming)) {
		return current;
	}

	if(trueAndMatch) {
		const incomingCommand = trueAndMatch[1].trim();

		return currentSegments.has(incomingCommand) ? current : `${current} && ${incomingCommand}`;
	}

	const mixed = mergeWithSemicolonMix(current, incoming);
	if(mixed) {
		return mixed;
	}

	const andMerged = mergeAndChains(current, incoming);
	if(andMerged) {
		return andMerged;
	}

	if(incoming.includes('||')) {
		return mergeOrSegments(current, incoming);
	}

	if(incoming.includes(';')) {
		return mergeSemicolonSegments(current, incoming);
	}

	const currentCommand = splitCommand(current);
	const incomingCommand = splitCommand(incoming);

	const merged = await mergeCommandRecords(currentCommand, incomingCommand, current);

	return joinCommand(merged);
}
