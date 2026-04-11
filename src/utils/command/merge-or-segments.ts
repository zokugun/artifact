import { dedupeStrings } from './dedupe-strings.js';
import { mergeFlagsAsString } from './merge-flags-as-string.js';
import { mergeSemicolonSegments } from './merge-semicolon-segments.js';
import { prefixOfCommand } from './prefix-of-command.js';
import { splitChain } from './split-chain.js';
import { splitPrefixAndFlags } from './split-prefix-and-flags.js';
import { splitSegments } from './split-segments.js';

export function mergeOrSegments(current: string, incoming: string): string {
	const currentSegments = splitSegments(current);
	const incomingSegments = splitSegments(incoming);

	const currentOrIndex = currentSegments.findIndex((s) => s.includes('||'));
	const incomingOrIndex = incomingSegments.findIndex((s) => s.includes('||'));

	if(currentOrIndex === -1 || incomingOrIndex === -1) {
		return mergeSemicolonSegments(current, incoming);
	}

	const currentParts = splitChain(currentSegments[currentOrIndex], '||');
	const incomingParts = splitChain(incomingSegments[incomingOrIndex], '||');
	const currentTail = currentSegments.filter((_, index) => index !== currentOrIndex);
	const incomingTail = incomingSegments.filter((_, index) => index !== incomingOrIndex);

	const maxLength = Math.max(currentParts.length, incomingParts.length);
	const chainResult: string[] = [];
	const movedToTail: string[] = [];

	for(let i = 0; i < maxLength; i++) {
		const currentPart = currentParts[i];
		const incomingPart = incomingParts[i];

		if(currentPart && incomingPart) {
			const cPref = prefixOfCommand(currentPart);
			const nPref = prefixOfCommand(incomingPart);

			if(cPref && nPref && cPref === nPref) {
				if(incomingTail.length > 0) {
					chainResult.push(mergeFlagsAsString(incomingPart, splitPrefixAndFlags(currentPart)));
				}
				else {
					chainResult.push(mergeFlagsAsString(currentPart, splitPrefixAndFlags(incomingPart)));
				}
			}
			else if(incomingTail.some((t) => t === currentPart || t.startsWith(`${currentPart} `))) {
				chainResult.push(incomingPart);
				movedToTail.push(currentPart);
			}
			else {
				chainResult.push(currentPart);
				const coveredByCurrentTail = currentTail.some((t) => t.startsWith(`${incomingPart} `));
				if(!coveredByCurrentTail) {
					chainResult.push(incomingPart);
				}
			}
		}
		else if(currentPart) {
			chainResult.push(currentPart);
		}
		else if(incomingPart) {
			chainResult.push(incomingPart);
		}
	}

	const dedupedChain: string[] = [];
	for(const part of chainResult) {
		if(!dedupedChain.includes(part)) {
			dedupedChain.push(part);
		}
	}

	const chainParts = new Set(dedupedChain);
	const rawTail = [...currentTail, ...movedToTail, ...incomingTail];
	const filteredTail = rawTail.filter((tail, index) => {
		if(chainParts.has(tail)) {
			return false;
		}

		// Keep only the most specific tail when two tails share a prefix.
		return !rawTail.some((other, otherIndex) => otherIndex !== index && other.startsWith(`${tail} `));
	});

	const mergedChain = dedupedChain.join(' || ');
	const chainPrefixes = new Set(dedupedChain.map(prefixOfCommand).filter(Boolean));
	const mergedSegs = currentSegments
		.map((seg, index) => (index === currentOrIndex ? mergedChain : seg))
		.filter((seg, index) => index === currentOrIndex || !chainPrefixes.has(prefixOfCommand(seg)));

	for(const tail of dedupeStrings(filteredTail)) {
		if(!mergedSegs.includes(tail)) {
			mergedSegs.push(tail);
		}
	}

	return dedupeStrings(mergedSegs).join('; ');
}
